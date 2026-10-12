export const panelStyles = `
.bubble{position:absolute;bottom:calc(100% + 16px);width:var(--mimimo-bubble-width,330px);max-width:calc(100vw - 24px);max-height:40dvh;overflow:auto;display:flex;align-items:flex-start;gap:10px;padding:var(--mimimo-bubble-padding,10px 16px);border:var(--mimimo-bubble-border,1px solid #ffffff26);border-radius:var(--mimimo-bubble-radius,28px);background:var(--mimimo-bubble-background,var(--mimimo-background,#353535));color:var(--mimimo-bubble-color,var(--mimimo-text,#f5f5f5));box-shadow:var(--mimimo-bubble-shadow,0 4px 18px #0005);font:var(--mimimo-bubble-font,13px/1.3 system-ui,sans-serif);overflow-wrap:anywhere;animation:mimimo-appear .18s ease-out}
.bubble[hidden],.panel[hidden],slot[hidden],[part=description][hidden]{display:none}
[part=message]{flex:1;min-width:0}
[part=title]{font-weight:700;white-space:pre-wrap}
[part=description]{color:var(--mimimo-bubble-muted,#aaa);margin-top:1px;white-space:pre-wrap}
[part=bubble-close]{border:0;background:transparent;color:inherit;width:24px;height:24px;padding:0;cursor:pointer;border-radius:50%;font:18px/1 system-ui}
.panel{position:absolute;top:calc(100% + 8px);width:max-content;max-width:calc(100vw - 24px);max-height:35dvh;overflow:auto;padding:var(--mimimo-panel-padding,6px);border:var(--mimimo-panel-border,1px solid #ffffff1c);border-radius:var(--mimimo-panel-radius,24px);background:var(--mimimo-panel-background,#1e1e1e);color:var(--mimimo-panel-color,#eee);box-shadow:var(--mimimo-panel-shadow,0 4px 14px #0004);animation:mimimo-appear .18s ease-out}
.panel form{display:flex;gap:6px;margin:0;width:260px;max-width:calc(100vw - 50px)}
.panel input{border-radius:18px}
.panel .send{border-radius:50%;min-width:30px}
button:focus-visible{outline:2px solid var(--mimimo-accent,#a78bfa);outline-offset:2px}
::slotted([slot=panel]){display:block;max-width:100%;box-sizing:border-box}
@keyframes mimimo-appear{from{opacity:0;translate:0 4px}to{opacity:1;translate:0 0}}
@media(prefers-reduced-motion:reduce){.bubble,.panel{animation:none}}
`;
