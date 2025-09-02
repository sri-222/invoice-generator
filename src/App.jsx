import React, { useEffect, useState } from "react";

// ZenVoice - A single-file React invoice generator app

// Utility: INR formatter
const fmtINR = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(v || 0);

// Simple localStorage helpers
const lsGet = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};
const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export default function App() {
  // Set the page title on initial render
  useEffect(() => {
    document.title = "ZenVoice - Invoice Generator";
  }, []);

  // App-level state
  const [view, setView] = useState("dashboard"); // dashboard | invoices | customers | settings

  // Settings (business profile)
  const [business, setBusiness] = useState(() =>
    lsGet("zen_business", {
      name: "ZenVoice",
      address: "123 Business Street, City - PIN",
      gstin: "22AAAAA0000A1Z5",
      invoicePrefix: "INV",
      nextInvoiceNo: 1,
    })
  );
  useEffect(() => lsSet("zen_business", business), [business]);

  // Customers
  const [customers, setCustomers] = useState(() => lsGet("zen_customers", []));
  useEffect(() => lsSet("zen_customers", customers), [customers]);

  // Invoices
  const [invoices, setInvoices] = useState(() => lsGet("zen_invoices", []));
  useEffect(() => lsSet("zen_invoices", invoices), [invoices]);

  // Small CSS injection so this file is standalone
  useEffect(() => {
    const id = "zenvoice-styles";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.innerHTML = `
      :root{--primary:#14b8a6;--bg:#f8fafc;--card:#fff;--text:#334155;--muted:#94a3b8;--border:#e2e8f0;}
      *{box-sizing:border-box}
      body{font-family:Inter,Segoe UI,Roboto,system-ui,-apple-system;background:var(--bg);margin:0;color:var(--text);}
      .app-shell{
        display:flex;
        min-height:100vh;
        gap:24px;
        padding:20px;
        max-width: 95%;
        margin:0 auto
      }
      .sidebar{width:220px;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:18px;align-self:flex-start;}
      .brand{font-weight:700;color:var(--primary);font-size:20px;margin-bottom:12px}
      .nav{display:flex;flex-direction:column;gap:8px}
      .nav button{background:transparent;border:none;text-align:left;padding:10px;border-radius:8px;cursor:pointer;font-size:15px;color:var(--text)}
      .nav button.active{background:rgba(20,184,166,0.1);color:var(--primary);font-weight:600}
      .nav button:hover{background:rgba(20,184,166,0.05);}
      .main{flex:1; min-width: 0;}
      .card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:24px;margin-bottom:24px}
      .row{display:flex;gap:18px}
      .form-grid{display:grid; grid-template-columns:1fr 1fr; gap:18px; align-items:flex-end;}
      h2{margin:0 0 18px 0; font-weight:600;}
      h3{margin:0 0 8px 0; font-weight:600;}
      table{width:100%;border-collapse:collapse}
      th,td{padding:12px 10px;border-bottom:1px solid var(--border);text-align:left}
      th{background:#f8fafc;color:#64748b;font-weight:600;font-size:13px;text-transform:uppercase;}
      tr:last-child td{border-bottom:none;}
      .right{text-align:right}
      .button{
        background:var(--primary);
        color:var(--text);
        border:none;
        padding:10px 16px;
        border-radius:8px;
        cursor:pointer;
        font-weight:600;
        font-size:14px;
      }
      .button.ghost{background:transparent;color:var(--primary);border:1px solid rgba(20,184,166,0.3);}
      .button:hover{opacity:0.9}
      .small{font-size:13px}
      label{display:block; margin-bottom:4px; font-weight:500;font-size:14px;}
      input,textarea,select{
        padding:10px;
        border:1px solid var(--border);
        border-radius:6px;
        width:100%;
        font-size:14px;
        background:#fff;
        color: var(--text);
      }
      .totals{width:320px;margin-left:auto}
      .totals-row{display:flex;justify-content:space-between;align-items:center;margin-top:8px;}
      .totals-row input{width:80px;text-align:right;}

      /* Hide arrows from number inputs */
      input[type=number]::-webkit-inner-spin-button, 
      input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
      }
      input[type=number] {
        -moz-appearance: textfield;
      }
      
      @media(max-width:900px){
        .app-shell{flex-direction:column;padding:12px; max-width:100%;}
        .sidebar{width:100%;display:flex;flex-direction:row;overflow:auto;align-items:center;}
        .nav{flex-direction:row;flex:1;}
        .brand{margin-bottom:0;}
        .main{width:100%;}
        .row, .form-grid {flex-direction:column; gap:12px;}
        .totals{width:100%;margin-left:0;}
      }
    `;
    document.head.appendChild(s);
  }, []);

  // Simple page components inlined
  const Dashboard = () => {
    const totalSales = invoices.reduce((a, inv) => a + inv.total, 0);
    const totalInvoices = invoices.length;
    const recent = [...invoices].slice(-5).reverse();
    return (
      <div>
        <div className="card">
          <h2>Dashboard</h2>
          <div className="row">
            <div style={{ flex: 1 }} className="card">
              <h3>Total Sales</h3>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {fmtINR(totalSales)}
              </div>
              <div className="small" style={{color: 'var(--muted)'}}>{totalInvoices} invoices</div>
            </div>
            <div style={{ width: 260 }} className="card">
              <h3>Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="button" onClick={() => setView("invoices")}>
                  Create Invoice
                </button>
                <button
                  className="button ghost"
                  onClick={() => setView("customers")}
                >
                  Manage Customers
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Recent Invoices</h2>
          {recent.length === 0 ? (
            <div style={{color: 'var(--muted)'}}>No invoices yet</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setView("invoices") || null}
                  >
                    <td>{inv.number}</td>
                    <td>{inv.customerName || "—"}</td>
                    <td className="right">{fmtINR(inv.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  const CustomersPage = () => {
    const [name, setName] = useState("");
    const [addr, setAddr] = useState("");
    const add = () => {
      if (!name) return alert("Name required");
      const c = { id: Date.now(), name, address: addr };
      setCustomers([...customers, c]);
      setName("");
      setAddr("");
    };
    const remove = (id) => setCustomers(customers.filter((c) => c.id !== id));
    return (
      <div>
        <div className="card">
          <h2>Customers</h2>
          <div style={{display:'flex', gap:12, alignItems:'flex-end'}}>
            <div style={{ flex: 1 }}>
              <label>Customer Name</label>
              <input
                placeholder="e.g. Acme Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label>Address</label>
              <input
                placeholder="e.g. 123 Innovation Drive"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
              />
            </div>
            <button className="button" onClick={add}>
              Add Customer
            </button>
          </div>
          <br />
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.address}</td>
                  <td className="right">
                    <button
                      className="button ghost"
                      onClick={() => remove(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const SettingsPage = () => {
    const [local, setLocal] = useState(business);
    const save = () => {
      setBusiness(local);
      alert("Settings saved");
    };
    return (
      <div>
        <div className="card">
          <h2>Settings</h2>
          <div className="form-grid">
            <div>
              <label>Business Name</label>
              <input
                value={local.name}
                onChange={(e) => setLocal({ ...local, name: e.target.value })}
              />
            </div>
            <div>
              <label>GSTIN</label>
              <input
                value={local.gstin}
                onChange={(e) => setLocal({ ...local, gstin: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Address</label>
              <textarea
                value={local.address}
                onChange={(e) =>
                  setLocal({ ...local, address: e.target.value })
                }
              />
            </div>
            <div>
              <label>Invoice Prefix</label>
              <input
                value={local.invoicePrefix}
                onChange={(e) =>
                  setLocal({ ...local, invoicePrefix: e.target.value })
                }
              />
            </div>
            <div>
              <label>Next Invoice No</label>
              <input
                type="number"
                value={local.nextInvoiceNo}
                onChange={(e) =>
                  setLocal({ ...local, nextInvoiceNo: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <button className="button" onClick={save}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  const InvoicesPage = () => {
    const emptyInvoice = {
      id: null,
      number: `${business.invoicePrefix}-${String(
        business.nextInvoiceNo
      ).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      customerAddress: "",
      items: [],
      gstRate: 18,
      subtotal: 0,
      gst: 0,
      total: 0,
    };
    const [draft, setDraft] = useState(emptyInvoice);
    useEffect(() => {
      if (!draft.id) {
        setDraft((d) => ({
          ...d,
          number: `${business.invoicePrefix}-${String(
            business.nextInvoiceNo
          ).padStart(3, "0")}`,
        }));
      }
    }, [business.invoicePrefix, business.nextInvoiceNo, draft.id]);

    const handleCustomerChange = (name) => {
      const existingCustomer = customers.find(c => c.name === name);
      setDraft(d => ({
        ...d,
        customerName: name,
        customerAddress: existingCustomer ? existingCustomer.address : '',
      }));
    };
    
    const computeTotals = (inv) => {
      const subtotal = inv.items.reduce(
        (a, it) => a + (Number(it.qty) || 0) * (Number(it.price) || 0),
        0
      );
      const gst = subtotal * ((Number(inv.gstRate) || 0) / 100);
      const total = subtotal + gst;
      return { ...inv, subtotal, gst, total };
    };
    
    const handleGstRateChange = (rate) => {
        setDraft(d => computeTotals({...d, gstRate: Number(rate)}));
    }

    const addItem = () => {
      setDraft((d) => ({
        ...d,
        items: [...d.items, { id: Date.now(), name: "", qty: '1', price: '0' }],
      }));
    };
    const updateItem = (id, key, val) => {
      setDraft((d) => {
        const items = d.items.map((it) =>
          it.id === id ? { ...it, [key]: val } : it
        );
        return computeTotals({ ...d, items });
      });
    };
    const removeItem = (id) =>
      setDraft((d) =>
        computeTotals({ ...d, items: d.items.filter((it) => it.id !== id) })
      );

    const saveInvoice = () => {
      if (draft.items.filter(it => it.name).length === 0) return alert("Add at least one item with a name");
      if (!draft.customerName) return alert("Please select or add a customer");
      
      const newInv = { ...draft, id: draft.id || Date.now() };
      const exists = invoices.find((i) => i.id === newInv.id);
      let nextList;
      if (exists) {
        nextList = invoices.map((i) => (i.id === newInv.id ? newInv : i));
      } else {
        nextList = [...invoices, newInv];
        setBusiness((b) => ({ ...b, nextInvoiceNo: b.nextInvoiceNo + 1 }));
      }
      setInvoices(nextList);

      const customerExists = customers.find(c => c.name === draft.customerName);
      if(!customerExists) {
        setCustomers(cs => [...cs, {id: Date.now(), name: draft.customerName, address: draft.customerAddress}]);
      }

      alert("Saved invoice");
      setDraft({
        ...emptyInvoice,
        number: `${business.invoicePrefix}-${String(
          business.nextInvoiceNo + (exists ? 0 : 1)
        ).padStart(3, "0")}`,
      });
    };
    
    const downloadPDF = () => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert("PDF library is not loaded yet. Please try again in a moment.");
            return;
        }

        const doc = new jsPDF();
        const itemsToPrint = draft.items.filter(it => it.name);

        // Add Business Details
        doc.setFontSize(20);
        doc.text(business.name, 14, 22);
        doc.setFontSize(11);
        doc.text(business.address, 14, 30);
        doc.text(`GSTIN: ${business.gstin}`, 14, 36);

        // Add Invoice Details
        doc.setFontSize(16);
        doc.text(`Invoice #${draft.number}`, 14, 50);
        doc.setFontSize(11);
        doc.text(`Date: ${draft.date}`, 14, 56);

        // Add Customer Details
        doc.text("Bill To:", 14, 66);
        doc.setFont("helvetica", "bold");
        doc.text(draft.customerName, 14, 72);
        doc.setFont("helvetica", "normal");
        doc.text(draft.customerAddress, 14, 78);

        // Add Items Table using autoTable
        doc.autoTable({
            startY: 90,
            head: [['Item', 'Qty', 'Price', 'Amount']],
            body: itemsToPrint.map(it => [
                it.name,
                it.qty,
                { content: fmtINR(it.price), styles: { halign: 'right' } },
                { content: fmtINR(it.qty * it.price), styles: { halign: 'right' } }
            ]),
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] }
        });

        // Add Totals
        const finalY = doc.autoTable.previous.finalY;
        doc.setFontSize(12);
        doc.text("Subtotal:", 150, finalY + 10, { align: 'right' });
        doc.text(fmtINR(draft.subtotal), 200, finalY + 10, { align: 'right' });
        doc.text(`GST (${draft.gstRate}%):`, 150, finalY + 17, { align: 'right' });
        doc.text(fmtINR(draft.gst), 200, finalY + 17, { align: 'right' });
        doc.setFont("helvetica", "bold");
        doc.text("Total:", 150, finalY + 24, { align: 'right' });
        doc.text(fmtINR(draft.total), 200, finalY + 24, { align: 'right' });
        
        // Save the PDF
        doc.save(`Invoice-${draft.number}.pdf`);
    };

    const printInvoice = () => {
      const w = window.open("", "_blank", "width=800,height=900");
      const itemsToPrint = draft.items.filter(it => it.name);

      const html = `
        <html><head><title>${draft.number}</title>
        <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd; text-align:left;} th:nth-child(n+2), td:nth-child(n+2){text-align:right;}</style>
        </head><body>
        <h2>${business.name}</h2>
        <p>${business.address.replace(/\n/g, "<br>")}</p>
        <hr/>
        <h3>Invoice ${draft.number}</h3>
        <p>Date: ${draft.date}</p>
        <p><b>To: ${draft.customerName}</b><br/>${draft.customerAddress.replace(/\n/g, "<br>")}</p>
        <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>
        ${itemsToPrint
          .map(
            (it) =>
              `<tr><td>${it.name}</td><td>${it.qty}</td><td>${fmtINR(
                it.price
              )}</td><td>${fmtINR(it.qty * it.price)}</td></tr>`
          )
          .join("")}
        </tbody></table>
        <br/>
        <table style="width:300px; margin-left:auto;">
          <tr><td>Subtotal</td><td>${fmtINR(draft.subtotal)}</td></tr>
          <tr><td>GST (${draft.gstRate}%)</td><td>${fmtINR(draft.gst)}</td></tr>
          <tr><td><b>Total</b></td><td><b>${fmtINR(draft.total)}</b></td></tr>
        </table>
        </body></html>`;
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    };

    const loadInvoice = (inv) => setDraft(inv);
    const deleteInvoice = (id) => setInvoices(invoices.filter((i) => i.id !== id));

    return (
      <div>
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <h2>{draft.id ? "Edit Invoice" : "Create Invoice"}</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                onChange={(e) =>
                  loadInvoice(
                    invoices.find((i) => i.id == e.target.value) || emptyInvoice
                  )
                }
                value={draft.id || ""}
              >
                <option value="">New Invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.number} — {fmtINR(inv.total)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="form-grid">
              <div>
                <label>Invoice Number</label>
                <input
                  value={draft.number}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, number: e.target.value }))
                  }
                />
              </div>
              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label>Customer Name</label>
                <input
                  list="customer-list"
                  value={draft.customerName}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  placeholder="Select or type a new customer"
                />
                <datalist id="customer-list">
                  {customers.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div>
                  <label>Customer Address</label>
                  <input
                    value={draft.customerAddress}
                    onChange={(e) => setDraft(d => ({ ...d, customerAddress: e.target.value }))}
                    placeholder="Auto-filled or enter new address"
                  />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h3>Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th className="right">Price</th>
                    <th className="right">Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {draft.items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <input
                          value={it.name}
                          onChange={(e) =>
                            updateItem(it.id, "name", e.target.value)
                          }
                          placeholder="Item description"
                        />
                      </td>
                      <td style={{ width: 80 }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={it.qty}
                          onChange={(e) => {
                            if (/^\d*$/.test(e.target.value)) {
                              updateItem(it.id, "qty", e.target.value);
                            }
                          }}
                        />
                      </td>
                      <td className="right">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={it.price}
                           onChange={(e) => {
                            if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                              updateItem(it.id, "price", e.target.value);
                            }
                          }}
                        />
                      </td>
                      <td className="right">
                        {fmtINR((Number(it.qty) || 0) * (Number(it.price) || 0))}
                      </td>
                      <td className="right">
                        <button
                          className="button ghost"
                          onClick={() => removeItem(it.id)}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="button ghost"
                style={{ marginTop: 12 }}
                onClick={addItem}
              >
                + Add Item
              </button>
            </div>

            <div className="totals card" style={{ marginTop: 24, padding:18 }}>
              <div className="totals-row">
                <div>Subtotal</div>
                <div>{fmtINR(draft.subtotal)}</div>
              </div>
              <div className="totals-row">
                <div>
                    GST Rate (%)
                </div>
                <input
                    type="number"
                    value={draft.gstRate}
                    onChange={(e) => handleGstRateChange(e.target.value)}
                />
              </div>
              <div className="totals-row">
                <div>GST Amount</div>
                <div>{fmtINR(draft.gst)}</div>
              </div>
              <hr style={{margin:"12px 0", borderTop:"1px solid var(--border)", borderBottom:"none"}}/>
              <div
                className="totals-row"
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                <div>Total</div>
                <div>{fmtINR(draft.total)}</div>
              </div>
            </div>
            
            <hr style={{margin:"24px 0", borderTop:"1px solid var(--border)", borderBottom:"none"}}/>

            <div style={{display:'flex', justifyContent:'space-between'}}>
                <div style={{display: 'flex', gap: '8px'}}>
                    <button className="button ghost" onClick={printInvoice}>Print</button>
                    <button className="button ghost" onClick={downloadPDF}>Download PDF</button>
                </div>
                <button className="button" onClick={saveInvoice}>
                    {draft.id ? "Update Invoice" : "Save Invoice"}
                </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Saved Invoices</h2>
          {invoices.length === 0 ? (
            <div style={{color: 'var(--muted)'}}>No saved invoices</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th className="right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.number}</td>
                    <td>{inv.date}</td>
                    <td>{inv.customerName}</td>
                    <td className="right">{fmtINR(inv.total)}</td>
                    <td className="right">
                      <button
                        className="button ghost"
                        onClick={() => loadInvoice(inv)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        className="button ghost"
                        onClick={() => deleteInvoice(inv.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <div className="sidebar card">
        <div className="brand">{business.name}</div>
        <div className="small" style={{ marginBottom: 10, color: 'var(--muted)'}}>
          {business.address}
        </div>
        <div className="nav">
          <button
            className={view === "dashboard" ? "active" : ""}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={view === "invoices" ? "active" : ""}
            onClick={() => setView("invoices")}
          >
            Invoices
          </button>
          <button
            className={view === "customers" ? "active" : ""}
            onClick={() => setView("customers")}
          >
            Customers
          </button>
          <button
            className={view === "settings" ? "active" : ""}
            onClick={() => setView("settings")}
          >
            Settings
          </button>
        </div>

        <hr style={{ margin: "14px 0", borderTop: '1px solid var(--border)', borderBottom:'none' }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="button ghost"
            style={{width:"100%"}}
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all data?")) {
                setInvoices([]);
                setCustomers([]);
                lsSet("zen_invoices", []);
                lsSet("zen_customers", []);
                alert("Cleared all data");
              }
            }}
          >
            Clear Data
          </button>
        </div>
      </div>

      <div className="main">
        {view === "dashboard" && <Dashboard />}
        {view === "invoices" && <InvoicesPage />}
        {view === "customers" && <CustomersPage />}
        {view === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}


