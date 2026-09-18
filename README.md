# Unshu Haplotype Viewer

[日本語版 README](README.ja.md)

A lightweight pangenome chromosome viewer for comparing six haplotypes from three citrus cultivars: Satsuma mandarin (Unshu) and its parental lineages, Kishu mandarin and Kunenbo mandarin.

The viewer projects Minigraph-Cactus GFA data onto reference chromosome coordinates and displays haplotype paths, shared nodes, local similarity to the parental lineages, candidate structural variants, and candidate trait-associated genes.

## Viewer

https://moriya-dbcls.github.io/unshu-haplotype-viewer/

## Repository contents

- `dist/`: Static viewer and Chr1–9 display data published through GitHub Pages
- `tools/`: Scripts for generating and merging lightweight viewer JSON files from GFA data
- `viewer_config.example.json`: Example mapping between GFA path names and viewer labels

## Local preview

```bash
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/` in a browser.

## Notes

Shared-node similarity does not directly measure nucleotide sequence identity, identity by descent, or parent–offspring relationships. See **Help** in the upper-right corner of the viewer for calculation details and interpretation notes.
