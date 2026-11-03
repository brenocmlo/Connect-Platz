// extension/modules/styles.js
// Estilos visuais isolados do Connect Platz CRM para injeção no Shadow DOM

window.PlatzStyles = `
  :host {
    all: initial;
    font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1E293B;
    font-size: 12px;
    line-height: 1.4;
    box-sizing: border-box;
  }
  *, *::before, *::after { box-sizing: inherit; margin: 0; padding: 0; }

  .platz-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    max-width: 320px;
    height: 100vh;
    background: #F8FAFC;
    border-left: 1px solid #E2E8F0;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    z-index: 999999;
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .platz-sidebar.collapsed { transform: translateX(100%); }

  .platz-toggle-btn {
    position: absolute;
    left: -28px;
    top: 45%;
    transform: translateY(-50%);
    width: 28px;
    height: 44px;
    background: #1266C7;
    color: #FFFFFF;
    border: none;
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: -3px 2px 8px rgba(0,0,0,0.18);
    font-weight: 700;
    font-size: 15px;
    transition: background 0.15s, transform 0.1s;
    z-index: 1000;
  }
  .platz-toggle-btn:hover { background: #0D478F; transform: translateY(-50%) scale(1.05); }

  .platz-header {
    padding: 10px 12px;
    background: #FFFFFF;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .platz-brand { display: flex; align-items: center; gap: 8px; overflow: hidden; }
  .platz-logo-badge {
    background: #1266C7;
    color: #FFFFFF;
    font-weight: 800;
    font-size: 10px;
    padding: 3px 6px;
    border-radius: 5px;
    letter-spacing: 0.5px;
  }
  .platz-user-badge { display: flex; flex-direction: column; line-height: 1.2; }
  .platz-user-name { font-weight: 700; font-size: 12px; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .platz-user-role { font-size: 9px; font-weight: 700; color: #1266C7; text-transform: uppercase; letter-spacing: 0.3px; }
  .platz-header-actions { display: flex; align-items: center; gap: 4px; }
  .platz-icon-btn {
    background: transparent;
    border: 1px solid #E2E8F0;
    color: #64748B;
    border-radius: 6px;
    padding: 3px 6px;
    cursor: pointer;
    font-size: 10px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    transition: all 0.15s;
  }
  .platz-icon-btn:hover { background: #F1F5F9; color: #0F172A; border-color: #CBD5E1; }

  .platz-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .platz-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }
  .platz-card-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748B;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
  }
  .platz-card-title::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 10px;
    background: #1266C7;
    margin-right: 5px;
    border-radius: 2px;
  }

  .platz-segmented { display: flex; background: #F1F5F9; border-radius: 7px; padding: 2px; gap: 2px; margin-bottom: 6px; }
  .platz-segmented-btn {
    flex: 1;
    padding: 4px 6px;
    font-size: 10px;
    font-weight: 600;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: #64748B;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s;
  }
  .platz-segmented-btn.active { background: #FFFFFF; color: #1266C7; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }

  .platz-lead-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
  .platz-lead-name { font-size: 13px; font-weight: 700; color: #0F172A; line-height: 1.2; }
  .platz-lead-phone { font-size: 11px; color: #64748B; margin-top: 1px; }
  .platz-badge-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 4px; }

  .platz-pill {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  .platz-pill-quente { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
  .platz-pill-morno { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
  .platz-pill-frio { background: #EFF6FF; color: #2563EB; border: 1px solid #93C5FD; }
  .platz-pill-sla-ok { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
  .platz-pill-sla-alert { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; animation: platz-pulse 2s infinite; }
  @keyframes platz-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

  .platz-select, .platz-input, .platz-textarea {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    font-family: inherit;
    font-size: 11px;
    background: #FFFFFF;
    color: #0F172A;
    outline: none;
    transition: border-color 0.15s;
  }
  .platz-select:focus, .platz-input:focus, .platz-textarea:focus { border-color: #1266C7; }

  .platz-btn-primary {
    width: 100%;
    background: #1266C7;
    color: #FFFFFF;
    border: none;
    border-radius: 7px;
    padding: 7px 10px;
    font-weight: 600;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: background 0.15s;
  }
  .platz-btn-primary:hover { background: #0D478F; }

  .platz-btn-secondary {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    color: #334155;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    transition: all 0.15s;
  }
  .platz-btn-secondary:hover { background: #F8FAFC; border-color: #CBD5E1; }

  .platz-category-tabs { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; margin-bottom: 6px; }
  .platz-category-tab {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 9999px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #64748B;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
  }
  .platz-category-tab.active { background: #1266C7; color: #FFFFFF; border-color: #1266C7; }

  .platz-templates-grid { display: flex; flex-direction: column; gap: 5px; max-height: 180px; overflow-y: auto; }
  .platz-template-item {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .platz-template-item:hover { background: #EFF6FF; border-color: #93C5FD; }
  .platz-template-title { font-weight: 600; font-size: 10px; color: #1266C7; margin-bottom: 1px; }
  .platz-template-preview { font-size: 9px; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .platz-timeline-item { padding: 4px 0; border-bottom: 1px dashed #E2E8F0; font-size: 10px; }
  .platz-timeline-meta { font-size: 8px; color: #94A3B8; display: flex; justify-content: space-between; margin-bottom: 1px; }
  .platz-empty-box { text-align: center; padding: 24px 12px; color: #64748B; }

  .platz-alert-banner {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FCD34D;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    margin-bottom: 6px;
  }

  .platz-toast {
    position: fixed;
    bottom: 12px;
    right: 12px;
    background: #0F172A;
    color: #FFFFFF;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.18);
    z-index: 1000000;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.2s;
  }
  .platz-toast.visible { opacity: 1; transform: translateY(0); }
`;
