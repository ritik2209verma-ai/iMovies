# 🎨 iMovies Architecture Diagrams & Visual Workflows

This directory contains system visualization diagrams modeled using **Mermaid.js** syntax for the **iMovies** movie ticket booking platform.

---

## 📑 Diagram Index

| Diagram Document | Description | Format | Direct Link |
| :--- | :--- | :--- | :--- |
| **Entity-Relationship (ER) Diagram** | Full schema relationships, keys, data types, compound indexes, and foreign references across all 8 Mongoose collections. | Mermaid `erDiagram` | [View ER Diagram](./er-diagram.md) |
| **User Flow & Journey Diagram** | Step-by-step customer journey from landing page discovery, auth, seat selection, Razorpay payment, public QR ticket sharing, and 2-hour cancellation engine. | Mermaid `flowchart TD` | [View User Flow](./user-flow.md) |

---

## 🛠️ Rendering & Tooling Support

All diagrams in this directory use standard **GitHub Flavored Markdown (GFM)** Mermaid code blocks (`mermaid`). They render natively in:
- **GitHub Repository View**: Automatically rendered on github.com.
- **VS Code / IDEs**: Using the Markdown Preview Mermaid Support extension.
- **Mermaid Live Editor**: Can be pasted directly into [mermaid.live](https://mermaid.live).

---

## 🔗 Related Documentation
- [System Architecture & MVC Implementation](../architecture.md)
- [Team Roles & Responsibilities Breakdown](../roles.md)
