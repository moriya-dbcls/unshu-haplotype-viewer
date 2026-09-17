#!/usr/bin/env python3
"""Update trait-locus coordinates from a primary-transcript GFF3 file."""

from __future__ import annotations

import argparse
import gzip
import json
import re
from pathlib import Path


def open_text(path: Path):
    return gzip.open(path, "rt") if path.suffix == ".gz" else path.open()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="existing trait_loci JSON")
    parser.add_argument("--gff", type=Path, required=True, help="primary-transcript GFF3 or GFF3.gz")
    parser.add_argument("--hap-key", default="CUNphKu", help="key used in each locus genes object")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--report", type=Path, help="optional old/new coordinate TSV")
    parser.add_argument("--coordinate-system", required=True)
    parser.add_argument("--mapping-method", required=True)
    parser.add_argument("--mapping-note-ja")
    parser.add_argument("--mapping-note-en")
    return parser.parse_args()


def chromosome_id(seqid: str) -> str:
    match = re.search(r"ch(\d+)$", seqid)
    if not match:
        raise ValueError(f"cannot derive chromosome from GFF seqid: {seqid}")
    return f"Chr{int(match.group(1))}"


def main() -> None:
    args = parse_args()
    data = json.loads(args.input.read_text())
    requested = {
        locus["genes"][args.hap_key]
        for locus in data.get("loci", [])
        if locus.get("genes", {}).get(args.hap_key)
    }
    features: dict[str, tuple[str, int, int, str]] = {}
    with open_text(args.gff) as handle:
        for line in handle:
            if line.startswith("#"):
                continue
            fields = line.rstrip().split("\t")
            if len(fields) < 9 or fields[2] != "mRNA":
                continue
            match = re.search(r"(?:^|;)geneID=([^;]+)", fields[8])
            if match and match.group(1) in requested:
                gene_id = match.group(1)
                if gene_id in features:
                    raise ValueError(f"duplicate primary transcript for {gene_id}")
                features[gene_id] = (chromosome_id(fields[0]), int(fields[3]), int(fields[4]), fields[6])

    missing = sorted(requested - features.keys())
    if missing:
        raise ValueError(f"genes missing from GFF: {', '.join(missing)}")

    report_rows = ["locus_id\tgene_id\told_chromosome\told_start\told_end\tnew_chromosome\tnew_start\tnew_end\tstrand"]
    for locus in data["loci"]:
        gene_id = locus.get("genes", {}).get(args.hap_key)
        if not gene_id:
            continue
        chromosome, start, end, strand = features[gene_id]
        report_rows.append("\t".join(map(str, [
            locus["id"], gene_id, locus["chromosome"], locus["start"], locus["end"],
            chromosome, start, end, strand,
        ])))
        locus["chromosome"] = chromosome
        locus["start"] = start
        locus["end"] = end
        mapping = locus.get("literature", {}).get("mapping")
        if mapping and args.mapping_note_ja:
            mapping["ja"] = f'{mapping.get("ja", "")} {args.mapping_note_ja}'.strip()
        if mapping and args.mapping_note_en:
            mapping["en"] = f'{mapping.get("en", "")} {args.mapping_note_en}'.strip()

    data["coordinateSystem"] = args.coordinate_system
    data["mappingMethod"] = args.mapping_method
    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    if args.report:
        args.report.write_text("\n".join(report_rows) + "\n")
    print(json.dumps({"output": str(args.output), "updated": len(report_rows) - 1, "report": str(args.report) if args.report else None}))


if __name__ == "__main__":
    main()
