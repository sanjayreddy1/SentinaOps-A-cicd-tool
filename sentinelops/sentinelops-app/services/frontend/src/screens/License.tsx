import { useState } from "react";

export default function License() {
  const [copied, setCopied] = useState(false);

  const licenseText = `MIT License

Copyright (c) 2026 Sanjay Kumar and Team (sentinelops)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

Rules and Regulations
---------------------

Usage rules:
- The software and its documentation may be copied, modified, and redistributed under the terms of this MIT license, provided that this license notice and the copyright notice are retained in all copies or substantial portions of the Software.
- Redistribution and use in source and binary forms, with or without modification, are permitted, but the software must not be used in a manner that causes harm, facilitates illegal activity, or violates any applicable laws or regulations.
- Users must not misrepresent the origin of the Software or claim that it is endorsed by the author without written permission.
- Any redistributions must retain this license text; the Software is provided "as is", without warranty of any kind, and the author shall not be liable for damages arising from its use.

Professional License Requirements:
- All copies and substantial portions of the Software must include the above copyright notice, the MIT license text, and this disclaimer in any redistribution, in source or binary form.
- Reverse engineering, decompilation, or disassembly of the Software is prohibited, except as required by applicable law.
- Modified versions and derivative works remain subject to this same license; they may not be redistributed under a different, more restrictive, or conflicting license without the author's prior written consent.
- Commercial, Government, or proprietary use of the Software is permitted under this MIT license only, without a separate paid license, provided use complies with all applicable laws, export control and sanctions regulations, and data protection and privacy requirements.
- The Software and the services built with it must not be used to facilitate spying, surveillance without consent, mass scraping of individuals, or any activity that violates privacy laws or other applicable regulations.
- License compliance, including attribution, notice retention, and record-keeping of copies and derivative works, is the responsibility of the end user and deployer.
- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #cbd5e1", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#000000", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚖️</span> SentinelOps License &amp; Terms
            </h1>
            <p style={{ marginTop: "0.35rem", fontSize: "0.95rem", fontWeight: 600, color: "#000000" }}>
              Official Open Source MIT License with Professional Compliance Standards
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCopy}
            style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <span>📋</span> {copied ? "✓ License Copied!" : "Copy Full License"}
          </button>
        </div>
      </div>

      {/* Prominent Copyright Banner */}
      <div
        className="card"
        style={{
          background: "#ffffff",
          border: "2px solid #000000",
          borderRadius: "10px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.8rem", color: "#000000" }}>©</span>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#000000", margin: 0 }}>
              Copyright © 2026 Sanjay Kumar and Team (sentinelops)
            </h2>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", fontWeight: 600, color: "#000000" }}>
              All Rights Reserved · Licensed under the terms of the MIT License
            </p>
          </div>
          <span
            className="badge badge-pass"
            style={{ marginLeft: "auto", fontSize: "0.75rem", padding: "4px 12px" }}
          >
            Verified MIT License
          </span>
        </div>
      </div>

      {/* License Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card" style={{ padding: "1rem", border: "1px solid #cbd5e1" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#000000", margin: "0 0 0.5rem" }}>
            ✓ Permitted
          </h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#000000", lineHeight: "1.6" }}>
            <li>Commercial &amp; Private Use</li>
            <li>Modification &amp; Distribution</li>
            <li>Sublicensing &amp; Merging</li>
            <li>Cloud &amp; Kubernetes Deployment</li>
          </ul>
        </div>

        <div className="card" style={{ padding: "1rem", border: "1px solid #cbd5e1" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#000000", margin: "0 0 0.5rem" }}>
            ⚠️ Conditions
          </h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#000000", lineHeight: "1.6" }}>
            <li>Include Copyright Notice © 2026</li>
            <li>Include Original MIT License Text</li>
            <li>Retain Attribution in All Copies</li>
          </ul>
        </div>

        <div className="card" style={{ padding: "1rem", border: "1px solid #cbd5e1" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#000000", margin: "0 0 0.5rem" }}>
            ✕ Limitations
          </h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#000000", lineHeight: "1.6" }}>
            <li>No Warranty Provided ("As-Is")</li>
            <li>No Liability for Damages</li>
            <li>No Unauthorized Endorsement</li>
          </ul>
        </div>
      </div>

      {/* Raw License Body */}
      <div className="card" style={{ padding: "1.5rem", border: "1px solid #cbd5e1", background: "#f8fafc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#000000" }}>
            LICENSE FILE CONTENT
          </span>
          <span style={{ fontSize: "0.75rem", color: "#000000", fontWeight: 600 }}>
            c:/Users/sanja/OneDrive/Desktop/cloud cap/LICENSE
          </span>
        </div>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "var(--font-mono)",
            fontSize: "0.82rem",
            lineHeight: "1.6",
            color: "#000000",
            background: "#ffffff",
            padding: "1rem",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
          }}
        >
          {licenseText}
        </pre>
      </div>
    </div>
  );
}
