export const printComparativaReport = ({
  datesLast,
  datesThis,
  repitenAmbosSabDom,
  repitenSabado,
  repitenDomingo,
  soloFindePasado,
  soloEsteFinde,
}) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(
      "Por favor, permite las ventanas emergentes para poder imprimir el reporte.",
    );
    return;
  }

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const rangeLastStr = `${formatDateStr(datesLast.saturday)} al ${formatDateStr(datesLast.sunday)}`;
  const rangeThisStr = `${formatDateStr(datesThis.saturday)} al ${formatDateStr(datesThis.sunday)}`;

  const renderArbRows = (list) => {
    if (list.length === 0)
      return '<tr><td colspan="5" style="text-align: center; color: #666; font-style: italic; padding: 10px;">No hay árbitros en esta categoría.</td></tr>';

    return list
      .map((arb) => {
        const renderMatches = (matches) => {
          if (matches.length === 0) return "Sin partidos";
          return matches.map((m) => `• ${m.cancha} (${m.hora})`).join("<br>");
        };

        const lastSaturdayStr = renderMatches(arb.lastSaturday);
        const lastSundayStr = renderMatches(arb.lastSunday);
        const thisSaturdayStr = renderMatches(arb.thisSaturday);
        const thisSundayStr = renderMatches(arb.thisSunday);

        let lastFindeCell = "";
        if (arb.lastSaturday.length > 0)
          lastFindeCell += `<strong>Sáb:</strong><br>${lastSaturdayStr}<br>`;
        if (arb.lastSunday.length > 0)
          lastFindeCell += `<strong>Dom:</strong><br>${lastSundayStr}`;
        if (!lastFindeCell) lastFindeCell = "Sin partidos";

        let thisFindeCell = "";
        if (arb.thisSaturday.length > 0)
          thisFindeCell += `<strong>Sáb:</strong><br>${thisSaturdayStr}<br>`;
        if (arb.thisSunday.length > 0)
          thisFindeCell += `<strong>Dom:</strong><br>${thisSundayStr}`;
        if (!thisFindeCell) thisFindeCell = "Sin partidos";

        return `
        <tr>
          <td>
            <strong>${arb.nombre} ${arb.apellido}</strong>
            <div style="font-size: 10px; color: #666;">${arb.rol} · ${arb.categoria}</div>
          </td>
          <td style="text-align: center; font-weight: bold;">${arb.lastWeekendCount}</td>
          <td>${lastFindeCell}</td>
          <td style="text-align: center; font-weight: bold;">${arb.thisWeekendCount}</td>
          <td>${thisFindeCell}</td>
        </tr>
      `;
      })
      .join("");
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Comparativa de Fines de Semana</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          margin: 30px;
          line-height: 1.4;
        }
        h1 {
          font-size: 20px;
          margin-bottom: 5px;
          color: #111;
        }
        .subtitle {
          font-size: 13px;
          color: #666;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 8px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-bottom: 30px;
        }
        .summary-card {
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 10px;
          background: #fafafa;
        }
        .summary-card.alert {
          border-left: 4px solid #ef4444;
          background: #fef2f2;
        }
        .summary-card.warn {
          border-left: 4px solid #f59e0b;
          background: #fffbeb;
        }
        .summary-card.info {
          border-left: 4px solid #3b82f6;
          background: #f0f7ff;
        }
        .summary-card.success {
          border-left: 4px solid #10b981;
          background: #ecfdf5;
        }
        .summary-title {
          font-size: 9px;
          text-transform: uppercase;
          font-weight: bold;
          color: #666;
        }
        .summary-value {
          font-size: 20px;
          font-weight: bold;
          margin-top: 5px;
        }
        h2 {
          font-size: 14px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
          margin-top: 25px;
          margin-bottom: 10px;
          color: #000;
          page-break-after: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        @media print {
          body {
            margin: 15px;
          }
          .summary-card {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      <h1>Comparativa de Fines de Semana</h1>
      <div class="subtitle">
        Reporte de asignaciones: <strong>Fin de semana pasado (${rangeLastStr})</strong> vs <strong>Este fin de semana (${rangeThisStr})</strong>
      </div>

      <div class="summary-grid">
        <div class="summary-card alert">
          <div class="summary-title" style="color: #991b1b;">Repiten Ambos</div>
          <div class="summary-value" style="color: #991b1b;">${repitenAmbosSabDom.length}</div>
        </div>
        <div class="summary-card warn" style="border-left: 4px solid #0f6e56; background: #e6f9f4;">
          <div class="summary-title" style="color: #0f6e56;">Repiten Sábado</div>
          <div class="summary-value" style="color: #0f6e56;">${repitenSabado.length}</div>
        </div>
        <div class="summary-card warn" style="border-left: 4px solid #185fa5; background: #f0f7ff;">
          <div class="summary-title" style="color: #185fa5;">Repiten Domingo</div>
          <div class="summary-value" style="color: #185fa5;">${repitenDomingo.length}</div>
        </div>
        <div class="summary-card info">
          <div class="summary-title" style="color: #1e3a8a;">Sólo Pasado</div>
          <div class="summary-value" style="color: #1e3a8a;">${soloFindePasado.length}</div>
        </div>
        <div class="summary-card success">
          <div class="summary-title" style="color: #065f46;">Sólo Este</div>
          <div class="summary-value" style="color: #065f46;">${soloEsteFinde.length}</div>
        </div>
      </div>

      <h2>1. Repiten Ambos Sábado y Domingo (Alerta carga doble)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(repitenAmbosSabDom)}
        </tbody>
      </table>

      <h2>2. Repiten Sábado (Sábado pasado y este Sábado)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(repitenSabado)}
        </tbody>
      </table>

      <h2>3. Repiten Domingo (Domingo pasado y este Domingo)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(repitenDomingo)}
        </tbody>
      </table>

      <h2>4. Sólo Fin de Semana Pasado (No dirigen este fin de semana)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(soloFindePasado)}
        </tbody>
      </table>

      <h2>5. Sólo Este Fin de Semana (No dirigieron el fin de semana anterior)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(soloEsteFinde)}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
};
