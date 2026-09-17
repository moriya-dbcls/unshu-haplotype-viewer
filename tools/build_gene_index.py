#!/usr/bin/env python3
"""Build the browser gene-search index from MiGD2 annotation tables.

CUNphKu coordinates are copied directly because CUN#1 is the CUNphKu
reference path. CUNphKi intervals are projected to CUN#1 with nodes shared by
the CUN#2 and CUN#1 paths in each chromosome GFA.
"""

from __future__ import annotations

import argparse
import bisect
import csv
import gzip
import json
import re
from collections import defaultdict
from pathlib import Path


COORD_RE = re.compile(r"CUNph(Ki|Ku)_r[\d.]+(ch[1-9]|Un\d+):(\d+)-(\d+)$")


def open_text(path: Path):
    return gzip.open(path, "rt") if path.suffix == ".gz" else path.open()


def clean(value: str | None) -> str:
    value = (value or "").strip()
    return "" if value in {"-", " -"} else value


def accession(value: str) -> str:
    value = clean(value)
    return value.split(" ", 1)[0] if value else ""


def description(value: str) -> str:
    return re.sub(r"\s+OS=.*$", "", clean(value)).strip()


def aliases(row: dict[str, str], curated: list[str]) -> list[str]:
    values = [row["Transcript_ID"], row.get("Ccle_AtID", "")]
    at_id = clean(row.get("Ccle_AtID"))
    if at_id and "." in at_id:
        values.append(at_id.split(".", 1)[0])
    values.extend(re.split(r"\s*,\s*", clean(row.get("Ccle_AtGeneSymbol"))))
    values.extend(accession(row.get(key, "")) for key in ("Ccle_homolog", "Citrus_homolog", "Sprot_homolog"))
    for key in ("Citrus_desc", "Sprot_desc"):
        values.extend(re.findall(r"\bGN=([^\s]+)", clean(row.get(key))))
    values.extend(curated)
    seen: set[str] = set()
    result = []
    for value in values:
        value = clean(value)
        if value and value != row["Gene_ID"] and value.casefold() not in seen:
            seen.add(value.casefold())
            result.append(value)
    return result


def read_annotations(path: Path, haplotype: str, curated: dict[str, list[str]]) -> list[dict]:
    genes = []
    with open_text(path) as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            match = COORD_RE.fullmatch(row["Seq_id:stt-end"])
            if not match:
                continue
            sequence = match.group(2)
            gene_id = row["Gene_ID"]
            function = (
                description(row.get("Citrus_desc", ""))
                or description(row.get("Ccle_AtDesc", ""))
                or description(row.get("Sprot_desc", ""))
                or "Uncharacterized protein"
            )
            curated_names = curated.get(gene_id, [])
            genes.append({
                "id": gene_id,
                "transcript": row["Transcript_ID"],
                "haplotype": haplotype,
                "sourceSequence": sequence,
                "sourceStart": int(match.group(3)),
                "sourceEnd": int(match.group(4)),
                "strand": row["Strand"],
                "name": curated_names[0] if curated_names else gene_id,
                "function": function,
                "aliases": aliases(row, curated_names),
            })
    return genes


def parse_walk(value: str) -> list[tuple[str, str]]:
    return [(token[:-1], token[-1]) for token in value.split(",") if token and token[-1] in "+-"]


def load_paths(gfa: Path) -> tuple[dict[str, int], list[tuple[str, str]], list[tuple[str, str]]]:
    lengths: dict[str, int] = {}
    paths: dict[str, list[tuple[str, str]]] = {}
    with gfa.open() as handle:
        for line in handle:
            if line.startswith("S\t"):
                fields = line.rstrip().split("\t")
                sequence = fields[2]
                length = len(sequence) if sequence != "*" else next((int(tag[5:]) for tag in fields[3:] if tag.startswith("LN:i:")), 1)
                lengths[fields[1]] = length
            elif line.startswith("P\tCUN#1#") or line.startswith("P\tCUN#2#"):
                fields = line.rstrip().split("\t", 3)
                key = "CUN#1" if fields[1].startswith("CUN#1#") else "CUN#2"
                paths[key] = parse_walk(fields[2])
    if "CUN#1" not in paths or "CUN#2" not in paths:
        raise ValueError(f"CUN#1/CUN#2 paths were not found in {gfa}")
    return lengths, paths["CUN#1"], paths["CUN#2"]


def path_records(walk: list[tuple[str, str]], lengths: dict[str, int]) -> tuple[list[int], list[tuple[int, int, str, str]]]:
    starts = []
    records = []
    cursor = 0
    for node, orientation in walk:
        length = lengths.get(node, 1)
        starts.append(cursor)
        records.append((cursor, cursor + length, node, orientation))
        cursor += length
    return starts, records


def map_piece(position: int, query: tuple[int, int, str, str], reference: tuple[int, int, str]) -> int:
    q_start, q_end, _node, q_orientation = query
    r_start, r_end, r_orientation = reference
    offset = position - q_start if q_orientation == "+" else q_end - position
    return r_start + offset if r_orientation == "+" else r_end - offset


def project_genes(genes: list[dict], gfa: Path, chromosome: str) -> dict[str, int]:
    lengths, reference_walk, query_walk = load_paths(gfa)
    _ref_starts, ref_records = path_records(reference_walk, lengths)
    query_starts, query_records = path_records(query_walk, lengths)
    occurrences: dict[str, list[tuple[int, int, str]]] = defaultdict(list)
    for start, end, node, orientation in ref_records:
        occurrences[node].append((start, end, orientation))
    ref_by_node = {node: records[0] for node, records in occurrences.items() if len(records) == 1}
    anchors = [(start, end, node, orientation, ref_by_node[node]) for start, end, node, orientation in query_records if node in ref_by_node]
    anchor_centers = [(item[0] + item[1]) / 2 for item in anchors]
    stats = defaultdict(int)

    for gene in genes:
        q_start = gene["sourceStart"] - 1
        q_end = gene["sourceEnd"]
        index = max(0, bisect.bisect_right(query_starts, q_start) - 1)
        mapped: list[tuple[int, int, int]] = []
        while index < len(query_records) and query_records[index][0] < q_end:
            record = query_records[index]
            overlap_start = max(q_start, record[0])
            overlap_end = min(q_end, record[1])
            reference = ref_by_node.get(record[2])
            if reference and overlap_end > overlap_start:
                a = map_piece(overlap_start, record, reference)
                b = map_piece(overlap_end, record, reference)
                mapped.append((min(a, b), max(a, b), overlap_end - overlap_start))
            index += 1

        length = max(1, q_end - q_start)
        if mapped:
            coverage = sum(item[2] for item in mapped) / length
            ref_start = min(item[0] for item in mapped)
            ref_end = max(item[1] for item in mapped)
            if ref_end - ref_start > max(1_000_000, length * 20):
                center_piece = min(mapped, key=lambda item: abs((item[0] + item[1]) / 2 - (ref_start + ref_end) / 2))
                center = (center_piece[0] + center_piece[1]) / 2
                ref_start = round(center - length / 2)
                ref_end = round(center + length / 2)
                mapping = "ambiguous-shared-node"
            else:
                mapping = "shared-node" if coverage >= .8 else "partial-shared-node"
            display_start = max(1, ref_start + 1)
            gene.update(chromosome=chromosome, start=display_start, end=max(display_start, ref_end), mapping=mapping, mappingCoverage=round(coverage, 3))
        elif anchors:
            center = (q_start + q_end) / 2
            ai = bisect.bisect_left(anchor_centers, center)
            choices = anchors[max(0, ai - 1):min(len(anchors), ai + 1)]
            anchor = min(choices, key=lambda item: abs((item[0] + item[1]) / 2 - center))
            query_record = (anchor[0], anchor[1], anchor[2], anchor[3])
            anchor_position = max(anchor[0], min(anchor[1], round(center)))
            ref_center = map_piece(anchor_position, query_record, anchor[4])
            display_start = max(1, round(ref_center - length / 2) + 1)
            gene.update(chromosome=chromosome, start=display_start, end=max(display_start, round(ref_center + length / 2)), mapping="nearest-shared-node", mappingCoverage=0)
        else:
            gene.update(chromosome=None, start=None, end=None, mapping="unmapped", mappingCoverage=0)
        stats[gene["mapping"]] += 1
    return dict(stats)


def curated_aliases(path: Path | None) -> dict[str, list[str]]:
    result: dict[str, list[str]] = defaultdict(list)
    if not path:
        return result
    data = json.loads(path.read_text())
    for locus in data.get("loci", []):
        for gene_id in locus.get("genes", {}).values():
            if gene_id:
                result[gene_id].append(locus["symbol"])
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ki", required=True, type=Path)
    parser.add_argument("--ku", required=True, type=Path)
    parser.add_argument("--gfa-dir", required=True, type=Path)
    parser.add_argument("--trait-json", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--assembly-version", default="v2")
    args = parser.parse_args()

    curated = curated_aliases(args.trait_json)
    ki_genes = read_annotations(args.ki, "CUNphKi", curated)
    ku_genes = read_annotations(args.ku, "CUNphKu", curated)

    for gene in ku_genes:
        sequence = gene["sourceSequence"]
        if sequence.startswith("ch"):
            gene.update(chromosome="Chr" + sequence[2:], start=gene["sourceStart"], end=gene["sourceEnd"], mapping="reference", mappingCoverage=1)
        else:
            gene.update(chromosome=None, start=None, end=None, mapping="unplaced", mappingCoverage=0)

    projection_stats: dict[str, dict[str, int]] = {}
    for chromosome_number in range(1, 10):
        source_sequence = f"ch{chromosome_number}"
        genes = [gene for gene in ki_genes if gene["sourceSequence"] == source_sequence]
        candidates = sorted(args.gfa_dir.glob(f"ch{chromosome_number}*.gfa"))
        if len(candidates) != 1:
            raise ValueError(f"Expected one GFA for {source_sequence}, found {len(candidates)}")
        projection_stats[f"Chr{chromosome_number}"] = project_genes(genes, candidates[0], f"Chr{chromosome_number}")
    for gene in ki_genes:
        if gene["sourceSequence"].startswith("Un"):
            gene.update(chromosome=None, start=None, end=None, mapping="unplaced", mappingCoverage=0)

    genes = ku_genes + ki_genes
    genes.sort(key=lambda item: (item["chromosome"] is None, item["chromosome"] or "", item["start"] or 0, item["haplotype"], item["id"]))
    result = {
        "schema": "unshu-haplotype-viewer/gene-index/v1",
        "assemblyVersion": args.assembly_version,
        "referencePath": "CUN#1 / CUNphKu",
        "coordinateNote": "CUNphKu uses direct annotation coordinates; CUNphKi is projected to CUN#1 with shared GFA nodes.",
        "genes": genes,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    print(json.dumps({"output": str(args.output), "genes": len(genes), "bytes": args.output.stat().st_size, "CUNphKiProjection": projection_stats}, ensure_ascii=False))


if __name__ == "__main__":
    main()
