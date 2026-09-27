import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import * as api from "../data/api.js";
import { VAT_RATE } from "../data/api.js";
import { dateTime, money } from "../lib/format.js";
import {
  Button,
  Card,
  EmptyState,
  Spinner,
} from "../components/ui/Primitives.jsx";
import { Receipt as ReceiptIcon } from "lucide-react";

export function Receipt() {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getSale(saleId)
      .then((record) => !cancelled && setSale(record))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [saleId]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <Card>
          <EmptyState
            icon={ReceiptIcon}
            title="Receipt not available"
            message={error}
          >
            <Link
              to="/sales"
              className="mt-2 text-sm font-semibold text-ink hover:underline"
            >
              Back to sales
            </Link>
          </EmptyState>
        </Card>
      </div>
    );
  }

  if (!sale)
    return (
      <div className="py-24">
        <Spinner label="Loading receipt" />
      </div>
    );

  const itemCount = sale.items.reduce((n, i) => n + i.qty, 0);

  // No shell around this one: a receipt is a document, so it gets a plain
  // page and a print stylesheet that strips even this chrome away.
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate("/sales")}>
          <ArrowLeft size={16} />{" "}
          Back to sales
        </Button>
        <Button onClick={() => window.print()}>
          <Printer size={16} /> Print receipt
        </Button>
      </div>

      <div className="print-sheet rounded-panel border border-line bg-white p-8 sm:p-10">
        <header className="border-b border-dashed border-line pb-5 text-center">
          <h1 className="text-lg font-bold tracking-widest text-ink">
            JANAYA COMPUTER SHOP
          </h1>
          <p className="mt-1 text-xs text-ink-3">
            Paseo del Congreso, Malolos, Bulacan · 0917 555 0143
          </p>
          <p className="text-xs text-ink-3">VAT Reg. TIN 004-882-115-000</p>
          <p className="mt-3 text-sm font-semibold tracking-wide text-ink-2 uppercase">
            Official Receipt
          </p>
        </header>

        <dl className="grid grid-cols-2 gap-y-1.5 border-b border-dashed border-line py-4 text-xs">
          <dt className="text-ink-3">Invoice no.</dt>
          <dd className="text-right font-semibold text-ink">
            {sale.invoiceNo}
          </dd>
          <dt className="text-ink-3">Date</dt>
          <dd className="text-right text-ink">{dateTime(sale.date)}</dd>
          <dt className="text-ink-3">Customer</dt>
          <dd className="text-right text-ink">{sale.customerName}</dd>
          <dt className="text-ink-3">Cashier</dt>
          <dd className="text-right text-ink">{sale.cashierName}</dd>
        </dl>

        <table className="w-full py-4 text-xs">
          <thead>
            <tr className="border-b border-line text-left text-ink-3">
              <th className="py-2 font-semibold">Item</th>
              <th className="py-2 text-right font-semibold">Qty</th>
              <th className="py-2 text-right font-semibold">Price</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {sale.items.map((line) => (
              <tr key={line.productId}>
                <td className="py-2 pr-2">
                  <span className="block text-ink">{line.name}</span>
                  <span className="font-mono text-[10px] text-ink-3">
                    {line.sku}
                  </span>
                </td>
                <td className="tnum py-2 text-right text-ink-2">{line.qty}</td>
                <td className="tnum py-2 text-right text-ink-2">
                  {money(line.price)}
                </td>
                <td className="tnum py-2 text-right font-semibold text-ink">
                  {money(line.price * line.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="tnum space-y-1.5 border-t border-dashed border-line pt-4 text-sm">
          <div className="flex justify-between text-ink-2">
            <dt>
              Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
            </dt>
            <dd>{money(sale.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-2">
            <dt>VAT ({Math.round(VAT_RATE * 100)}%)</dt>
            <dd>{money(sale.vat)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
            <dt>Total</dt>
            <dd>{money(sale.total)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-ink-2">
            <dt>Paid ({sale.payment.method})</dt>
            <dd>{money(sale.payment.tendered)}</dd>
          </div>
          <div className="flex justify-between text-ink-2">
            <dt>Change</dt>
            <dd>{money(Math.max(sale.payment.change, 0))}</dd>
          </div>
        </dl>

        <footer className="mt-6 border-t border-dashed border-line pt-4 text-center text-[11px] text-ink-3">
          <p>Thank you for shopping at Janaya Computer Shop.</p>
          <p className="mt-1">
            Goods sold are covered by the manufacturer warranty. Keep this
            receipt for any claim.
          </p>
        </footer>
      </div>
    </div>
  );
}
