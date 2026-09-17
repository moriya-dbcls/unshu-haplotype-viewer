#!/usr/bin/env python3
"""Merge chromosome-level Citrus PathWeaver JSON files."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="+", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--title", default="柑橘3品種・6ハプロタイプ GFA projection")
    parser.add_argument("--dataset-version")
    parser.add_argument("--reference-assembly")
    args = parser.parse_args()

    documents = [json.loads(path.read_text()) for path in args.inputs]
    if any(document.get("schema") != "citrus-pathweaver/v1" for document in documents):
        raise ValueError("All inputs must use citrus-pathweaver/v1")
    path_ids = {path["id"] for path in documents[0]["paths"]}
    for document in documents[1:]:
        if {path["id"] for path in document["paths"]} != path_ids:
            raise ValueError("Input path sets differ")

    chromosomes = []
    assignments = {}
    for source, document in zip(args.inputs, documents):
        chromosomes.extend(document["chromosomes"])
        for chromosome in document["chromosomes"]:
            assignments[chromosome["id"]] = document.get("originAssignment", {})
    chromosomes.sort(key=lambda chromosome: int("".join(filter(str.isdigit, chromosome["id"])) or 0))

    result = {
        "schema": "citrus-pathweaver/v1",
        "title": args.title,
        "coordinateSystem": "reference-path",
        "paths": documents[0]["paths"],
        "chromosomes": chromosomes,
        "originAssignmentByChromosome": assignments,
    }
    if args.dataset_version:
        result["datasetVersion"] = args.dataset_version
    if args.reference_assembly:
        result["referenceAssembly"] = args.reference_assembly
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    print(json.dumps({"output": str(args.output), "chromosomes": [chromosome["id"] for chromosome in chromosomes], "size_kib": round(args.output.stat().st_size / 1024, 1)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
