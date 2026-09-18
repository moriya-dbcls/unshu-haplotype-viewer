# Unshu Haplotype Viewer

[English README](README.md)

温州みかん（Satsuma mandarin / Unshu）と、その親系統である紀州みかん・九年母の3品種6ハプロタイプを比較する、軽量なパンゲノム染色体ビューワです。

Minigraph-Cactus由来のGFAを参照染色体座標へ投影し、ハプロタイプ経路、共有ノード、親系統との局所類似度、構造変異候補、表現型候補遺伝子を表示します。

## Viewer

https://moriya-dbcls.github.io/unshu-haplotype-viewer/

## Repository contents

- `dist/`: GitHub Pagesで配信する静的ビューアとChr1–9の表示用データ
- `tools/`: GFAから軽量viewer JSONを生成・結合するスクリプト
- `viewer_config.example.json`: GFAパス名と表示名の対応例

## Local preview

```bash
python3 -m http.server 8000 --directory dist
```

ブラウザで `http://localhost:8000/` を開いてください。

## Notes

共有ノード類似度は、塩基配列identity、IBD、親子関係を直接示す値ではありません。詳しい計算方法と解釈上の注意は、ビューア右上のHelpに記載しています。
