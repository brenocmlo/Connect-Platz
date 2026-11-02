// extension/modules/styles.js
// Estilos visuais isolados do Connect Platz CRM para injeção no Shadow DOM

window.PlatzStyles = `
  :host {
    all: initial;
    font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1E293B;
    font-size: 13px;
    line-height: 1.4;
    box-sizing: border-box;
  }

  *, *::before, *::after {
    box-sizing: inherit;
    margin: 0;
    padding: 0;
  }

  .platz-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 380px;
    height: 100vh;
    background: #F8FAFC;
    border-left: 1px solid #E2E8F0;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    z-index: 999999;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .platz-sidebar.collapsed {
    transform: translateX(340px);
  }

  .platz-toggle-btn {
    position: absolute;
    left: -32px;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 48px;
    background: #1266C7;
    color: #FFFFFF;
    border: none;
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: -2px 2px 8px rgba(0,0,0,0.15);
    font-weight: bold;
    font-size: 16px;
    transition: background 0.2s;
  }

  .platz-toggle-btn:hover {
    background: #0D478F;
  }

  .platz-header {
    padding: 12px 16px;
    background: #FFFFFF;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .platz-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .platz-logo-badge {
    background: #1266C7;
    color: #FFFFFF;
    font-weight: 800;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 6px;
    letter-spacing: 0.5px;
  }

  .platz-user-badge {
    display: flex;
    flex-direction: column;
  }

  .platz-user-name {
    font-weight: 700;
    font-size: 12px;
    color: #0F172A;
  }

  .platz-user-role {
    font-size: 10px;
    font-weight: 600;
    color: #1266C7;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .platz-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .platz-icon-btn {
    background: transparent;
    border: 1px solid #E2E8F0;
    color: #64748B;
    border-radius: 6px;
    padding: 4px 6px;
    cursor: pointer;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s;
  }

  .platz-icon-btn:hover {
    background: #F1F5F9;
    color: #0F172A;
    border-color: #CBD5E1;
  }

  .platz-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .platz-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .platz-card-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748B;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .platz-card-title::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 12px;
    background: #1266C7;
    margin-right: 6px;
    border-radius: 2px;
  }

  .platz-lead-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .platz-lead-name {
    font-size: 14px;
    font-weight: 700;
    color: #0F172A;
  }

  .platz-lead-phone {
    font-size: 12px;
    color: #64748B;
    margin-top: 2px;
  }

  .platz-badge-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .platz-pill {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .platz-pill-quente { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
  .platz-pill-morno { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
  .platz-pill-frio { background: #EFF6FF; color: #2563EB; border: 1px solid #93C5FD; }
  .platz-pill-sla-ok { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
  .platz-pill-sla-alert { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; animation: platz-pulse 2s infinite; }

  @keyframes platz-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .platz-select, .platz-input, .platz-textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    font-family: inherit;
    font-size: 12px;
    background: #FFFFFF;
    color: #0F172A;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .platz-select:focus, .platz-input:focus, .platz-textarea:focus {
    border-color: #1266C7;
    box-shadow: 0 0 0 2px rgba(18, 102, 199, 0.15);
  }

  .platz-btn-primary {
    width: 100%;
    background: #1266C7;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s, transform 0.1s;
  }

  .platz-btn-primary:hover {
    background: #0D478F;
  }

  .platz-btn-primary:active {
    transform: scale(0.98);
  }

  .platz-btn-secondary {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    color: #334155;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s;
  }

  .platz-btn-secondary:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
  }

  .platz-templates-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .platz-template-item {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .platz-template-item:hover {
    background: #EFF6FF;
    border-color: #93C5FD;
  }

  .platz-template-title {
    font-weight: 600;
    font-size: 11px;
    color: #1266C7;
    margin-bottom: 2px;
  }

  .platz-template-preview {
    font-size: 10px;
    color: #64748B;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .platz-timeline-item {
    padding: 6px 0;
    border-bottom: 1px dashed #E2E8F0;
    font-size: 11px;
  }

  .platz-timeline-item:last-child {
    border-bottom: none;
  }

  .platz-timeline-meta {
    font-size: 9px;
    color: #94A3B8;
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .platz-empty-box {
    text-align: center;
    padding: 24px 16px;
    color: #64748B;
  }

  .platz-toast {
    position: fixed;
    bottom: 16px;
    right: 16px;
    background: #0F172A;
    color: #FFFFFF;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000000;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.2s;
  }

  .platz-toast.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
