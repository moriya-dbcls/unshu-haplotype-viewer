#!/usr/bin/env python3
"""Project a regional GFA onto one path and emit Citrus PathWeaver JSON."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path


PATH_STYLE = {
    "CKI#1": ("CKIhap1", "紀州 hap1", "CKI h1", "kishu", "#f0ad3d"),
    "CKI#2": ("CKIhap2", "紀州 hap2", "CKI h2", "kishu", "#ffd889"),
    "CKU#1": ("CKUhap1", "九年母 hap1", "CKU h1", "kunenbo", "#3e94d8"),
    "CKU#2": ("CKUhap2", "九年母 hap2", "CKU h2", "kunenbo", "#8ec7ee"),
}


def canonical(name: str) -> str:
    fields = name.split("#")
    return "#".join(fields[:2]) if len(fields) >= 2 else name.split(":", 1)[0]


def parse_walk(value: str) -> list[tuple[str, str]]:
    return [(token[:-1], token[-1]) for token in value.split(",") if token and token[-1] in "+-"]


def path_interval(name: str, span: int) -> tuple[int, int]:
    match = re.search(r":(\d+)-(\d+)$", name)
    return (int(match.group(1)), int(match.group(2))) if match else (0, span)


def weighted_jaccard(a: set[str], b: set[str], lengths: dict[str, int]) -> float:
    union = a | b
    if not union:
        return 0.0
    return sum(lengths.get(node, 1) for node in a & b) / sum(lengths.get(node, 1) for node in union)


def choose_cun_origins(node_sets: dict[str, set[str]], lengths: dict[str, int]) -> tuple[dict[str, str], dict[str, dict[str, float]]]:
    scores: dict[str, dict[str, float]] = {}
    for child in ("CUN#1", "CUN#2"):
        scores[child] = {
            "kishu": max((weighted_jaccard(node_sets.get(child, set()), node_sets.get(p, set()), lengths) for p in ("CKI#1", "CKI#2")), default=0),
            "kunenbo": max((weighted_jaccard(node_sets.get(child, set()), node_sets.get(p, set()), lengths) for p in ("CKU#1", "CKU#2")), default=0),
        }
    direct = scores["CUN#1"]["kishu"] + scores["CUN#2"]["kunenbo"]
    swapped = scores["CUN#1"]["kunenbo"] + scores["CUN#2"]["kishu"]
    mapping = {"CUN#1": "kishu", "CUN#2": "kunenbo"} if direct >= swapped else {"CUN#1": "kunenbo", "CUN#2": "kishu"}
    return mapping, scores


def stable_switches(scores: list[dict[str, float]], span_start: int, span_end: int) -> list[float]:
    states = [1 if x["score"] > 0.08 else -1 if x["score"] < -0.08 else 0 for x in scores]
    result: list[float] = []
    previous = 0
    for index, state in enumerate(states):
        if state == 0 or index + 2 >= len(states) or not all(value == state for value in states[index:index + 3]):
            continue
        if previous and state != previous:
            result.append(scores[index]["position"] / max(1, span_end))
        previous = state
    return result


def branch_digest(nodes: list[tuple[str, str]]) -> str:
    """Return a stable, compact identity for one off-reference walk."""
    digest = hashlib.sha1()
    for node, orientation in nodes:
        digest.update(node.encode())
        digest.update(orientation.encode())
        digest.update(b"\0")
    return digest.hexdigest()[:16]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("gfa", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--reference", default="CUN#1")
    parser.add_argument("--bin-width", type=int, default=5000)
    parser.add_argument("--min-branch-bp", type=int, default=50, help="minimum off-reference length retained for local graph rendering")
    args = parser.parse_args()

    lengths: dict[str, int] = {}
    path_records: list[tuple[str, str, list[tuple[str, str]]]] = []
    with args.gfa.open() as handle:
        for line in handle:
            if line.startswith("S\t"):
                fields = line.rstrip().split("\t")
                sequence = fields[2]
                length = len(sequence) if sequence != "*" else next((int(tag[5:]) for tag in fields[3:] if tag.startswith("LN:i:")), 1)
                lengths[fields[1]] = length
            elif line.startswith("P\t"):
                fields = line.rstrip().split("\t", 3)
                path_records.append((canonical(fields[1]), fields[1], parse_walk(fields[2])))

    if not path_records:
        raise ValueError("No P records found in GFA")
    grouped: dict[str, list[tuple[str, list[tuple[str, str]]]]] = defaultdict(list)
    node_sets: dict[str, set[str]] = defaultdict(set)
    for key, name, walk in path_records:
        grouped[key].append((name, walk))
        node_sets[key].update(node for node, _ in walk)

    reference_records = grouped.get(args.reference)
    if not reference_records:
        raise ValueError(f"Reference path {args.reference!r} not found")
    reference_name, reference_walk = max(reference_records, key=lambda record: sum(lengths.get(node, 1) for node, _ in record[1]))
    reference_fields = reference_name.split("#")
    raw_chromosome = reference_fields[2].split(":", 1)[0] if len(reference_fields) >= 3 else "ch1"
    chromosome_id = "Chr" + raw_chromosome[2:] if raw_chromosome.lower().startswith("ch") else raw_chromosome
    reference_span = sum(lengths.get(node, 1) for node, _ in reference_walk)
    view_start, view_end = path_interval(reference_name, reference_span)
    if view_end <= view_start:
        view_end = view_start + reference_span

    node_positions: dict[str, tuple[int, int, str]] = {}
    cursor = view_start
    for node, orientation in reference_walk:
        node_length = lengths.get(node, 1)
        node_positions[node] = (cursor, cursor + node_length, orientation)
        cursor += node_length
    view_end = max(view_end, cursor)

    origin_map, origin_scores = choose_cun_origins(node_sets, lengths)
    source_to_id = {key: value[0] for key, value in PATH_STYLE.items()}
    for source, origin in origin_map.items():
        source_to_id[source] = "CUNphKi" if origin == "kishu" else "CUNphKu"

    paths = []
    for source in ("CKI#1", "CKI#2", next(k for k, v in origin_map.items() if v == "kishu"), next(k for k, v in origin_map.items() if v == "kunenbo"), "CKU#1", "CKU#2"):
        if source.startswith("CUN"):
            origin = origin_map[source]
            style = (source_to_id[source], f"温州・{'紀州' if origin == 'kishu' else '九年母'}由来候補", "CUN Ki" if origin == "kishu" else "CUN Ku", f"mikan-{origin}", "#f4bd55" if origin == "kishu" else "#59a9df")
        else:
            style = PATH_STYLE[source]
        paths.append(dict(zip(("id", "label", "short", "group", "color"), style)))

    bin_width = args.bin_width
    bins = [(start, min(start + bin_width, view_end)) for start in range(view_start, view_end, bin_width)]

    # Keep two complementary representations of sequence absent from the
    # reference path: a light chromosome-wide summary and selected anchored
    # walks for the local graph.  The local records deliberately omit raw
    # sequences and node IDs so that the browser JSON stays small.
    off_reference_bins = [{"start": start, "end": end, "bp": 0, "branches": 0, "paths": set(), "bpByPath": {}} for start, end in bins]
    graph_branch_index: dict[tuple[int, int, str], dict] = {}
    unplaced_bp: dict[str, int] = defaultdict(int)
    for source, records in grouped.items():
        viewer_id = source_to_id.get(source)
        if not viewer_id:
            continue
        for _, walk in records:
            previous_anchor: str | None = None
            off_walk: list[tuple[str, str]] = []

            def commit_branch(next_anchor: str | None) -> None:
                nonlocal off_walk, previous_anchor
                if not off_walk:
                    return
                off_bp = sum(lengths.get(node, 1) for node, _ in off_walk)
                left = node_positions.get(previous_anchor) if previous_anchor else None
                right = node_positions.get(next_anchor) if next_anchor else None
                if left and right:
                    anchor_start, anchor_end = sorted((left[1], right[0]))
                    kind = "two-anchor"
                    reversed_anchors = right[0] < left[1]
                elif left:
                    anchor_start = anchor_end = left[1]
                    kind = "left-anchor"
                    reversed_anchors = False
                elif right:
                    anchor_start = anchor_end = right[0]
                    kind = "right-anchor"
                    reversed_anchors = False
                else:
                    unplaced_bp[viewer_id] += off_bp
                    off_walk = []
                    return

                midpoint = (anchor_start + anchor_end) / 2
                bin_index = min(len(bins) - 1, max(0, int((midpoint - view_start) // bin_width)))
                summary = off_reference_bins[bin_index]
                summary["bp"] += off_bp
                summary["branches"] += 1
                summary["paths"].add(viewer_id)
                summary["bpByPath"][viewer_id] = summary["bpByPath"].get(viewer_id, 0) + off_bp

                if off_bp >= args.min_branch_bp:
                    digest = branch_digest(off_walk)
                    key = (anchor_start, anchor_end, digest)
                    branch = graph_branch_index.get(key)
                    if branch is None:
                        branch = {
                            "id": f"branch-{len(graph_branch_index) + 1}",
                            "start": anchor_start,
                            "end": anchor_end,
                            "offReferenceBp": off_bp,
                            "nodeCount": len(off_walk),
                            "kind": kind,
                            "reversedAnchors": reversed_anchors,
                            "support": set(),
                        }
                        graph_branch_index[key] = branch
                    branch["support"].add(viewer_id)
                off_walk = []

            for node, orientation in walk:
                if node in node_positions:
                    commit_branch(node)
                    previous_anchor = node
                else:
                    off_walk.append((node, orientation))
            commit_branch(None)

    def branch_lineage(support: set[str]) -> str:
        kishu = {"CKIhap1", "CKIhap2", "CUNphKi"}
        kunenbo = {"CKUhap1", "CKUhap2", "CUNphKu"}
        if support and support <= kishu:
            return "kishu"
        if support and support <= kunenbo:
            return "kunenbo"
        return "shared"

    graph_branches = []
    for branch in graph_branch_index.values():
        branch["support"] = sorted(branch["support"])
        branch["lineage"] = branch_lineage(set(branch["support"]))
        graph_branches.append(branch)
    graph_branches.sort(key=lambda branch: (branch["start"], branch["end"], -branch["offReferenceBp"]))
    for summary in off_reference_bins:
        summary["paths"] = sorted(summary["paths"])
    source_nodes: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    for source, records in grouped.items():
        for _, walk in records:
            for node, orientation in walk:
                source_nodes[source][node].add(orientation)

    tracks: dict[str, list[dict[str, float]]] = defaultdict(list)
    bin_node_sets: dict[str, list[set[str]]] = defaultdict(list)
    for source, viewer_id in source_to_id.items():
        covered_bases = [0] * len(bins)
        inverted_bases = [0] * len(bins)
        shared_nodes = [set() for _ in bins]
        for node, (node_start, node_end, ref_orientation) in node_positions.items():
            if node not in source_nodes[source] or node_end <= view_start or node_start >= view_end:
                continue
            first_bin = max(0, (node_start - view_start) // bin_width)
            last_bin = min(len(bins) - 1, (max(node_start, node_end - 1) - view_start) // bin_width)
            for index in range(first_bin, last_bin + 1):
                start, end = bins[index]
                overlap = max(0, min(end, node_end) - max(start, node_start))
                if not overlap:
                    continue
                shared_nodes[index].add(node)
                covered_bases[index] += overlap
                if ref_orientation not in source_nodes[source][node]:
                    inverted_bases[index] += overlap
        for index, (start, end) in enumerate(bins):
            covered = covered_bases[index]
            inverted = inverted_bases[index]
            width = max(1, end - start)
            tracks[viewer_id].append({"start": start, "end": end, "coverage": round(covered / width, 4), "inversion": round(inverted / max(1, covered), 4), "meanPosition": (start + end) / 2})
            bin_node_sets[source].append(shared_nodes[index])

    def similarity_track(child_source: str, parent_a: str, parent_b: str) -> list[dict[str, float]]:
        output = []
        for index, (start, end) in enumerate(bins):
            child = bin_node_sets[child_source][index]
            a = weighted_jaccard(child, bin_node_sets[parent_a][index], lengths)
            b = weighted_jaccard(child, bin_node_sets[parent_b][index], lengths)
            output.append({"position": (start + end) / 2, "score": round(a - b, 5), "parent1": round(a, 5), "parent2": round(b, 5)})
        return output

    ki_source = next(k for k, v in origin_map.items() if v == "kishu")
    ku_source = next(k for k, v in origin_map.items() if v == "kunenbo")
    similarity_ki = similarity_track(ki_source, "CKI#1", "CKI#2")
    similarity_ku = similarity_track(ku_source, "CKU#1", "CKU#2")

    def parent_origin_track(child_source: str) -> list[dict[str, float]]:
        """Score one Satsuma path against both parental cultivar groups."""
        output = []
        for index, (start, end) in enumerate(bins):
            child = bin_node_sets[child_source][index]
            kishu = max(
                weighted_jaccard(child, bin_node_sets[parent][index], lengths)
                for parent in ("CKI#1", "CKI#2")
            )
            kunenbo = max(
                weighted_jaccard(child, bin_node_sets[parent][index], lengths)
                for parent in ("CKU#1", "CKU#2")
            )
            kishu_group = bin_node_sets["CKI#1"][index] | bin_node_sets["CKI#2"][index]
            kunenbo_group = bin_node_sets["CKU#1"][index] | bin_node_sets["CKU#2"][index]
            parent_union = kishu_group | kunenbo_group
            parent_similarity = weighted_jaccard(kishu_group, kunenbo_group, lengths) if parent_union else 1.0
            output.append({
                "position": (start + end) / 2,
                "score": round(kishu - kunenbo, 5),
                "kishu": round(kishu, 5),
                "kunenbo": round(kunenbo, 5),
                "parentSeparability": round(1 - parent_similarity, 5),
                "comparable": bool(child and parent_union),
            })
        return output

    parent_origin = {
        "CUNphKi": parent_origin_track(ki_source),
        "CUNphKu": parent_origin_track(ku_source),
    }

    divergence = []
    all_sources = set(source_to_id)
    active = None
    for index, (start, end) in enumerate(bins):
        present = sum(bool(bin_node_sets[source][index]) for source in all_sources)
        divergent = 0 < present < len(all_sources)
        if divergent and active is None:
            active = [start, end, present]
        elif divergent:
            active[1] = end; active[2] = min(active[2], present)
        elif active:
            divergence.append(active); active = None
    if active:
        divergence.append(active)
    variants = [{"id": f"graph-{i+1}", "start": start, "end": end, "type": "BUBBLE", "label": "経路差候補", "support": [p["id"] for p in paths], "confidence": round(100 * present / len(all_sources))} for i, (start, end, present) in enumerate(divergence)]

    result = {
        "schema": "citrus-pathweaver/v1",
        "title": f"{args.gfa.stem} GFA projection",
        "coordinateSystem": "reference-path",
        "binWidth": bin_width,
        "paths": paths,
        "chromosomes": [{
            "id": chromosome_id, "length": view_end, "viewStart": view_start, "viewEnd": view_end,
            "switchesKi": stable_switches(similarity_ki, view_start, view_end),
            "switchesKu": stable_switches(similarity_ku, view_start, view_end),
            "similarityKi": similarity_ki, "similarityKu": similarity_ku,
            "parentOrigin": parent_origin,
            "variants": variants, "tracks": tracks,
            "offReferenceBins": off_reference_bins,
            "graphBranches": graph_branches,
            "unplacedOffReferenceBp": dict(unplaced_bp),
            "source": {"gfa": args.gfa.name, "referencePath": reference_name, "projection": "shared reference nodes"},
        }],
        "originAssignment": {
            "method": "one-to-one weighted node-set Jaccard; provisional",
            "mapping": origin_map,
            "scores": origin_scores,
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    print(json.dumps({"output": str(args.output), "size_kib": round(args.output.stat().st_size / 1024, 1), "view": [view_start, view_end], "graph_branches": len(graph_branches), "origin_assignment": origin_map, "origin_scores": origin_scores}, ensure_ascii=False))


if __name__ == "__main__":
    main()
