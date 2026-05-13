import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Airbnb API – Welcome</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    /* Animated mesh gradient background */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,56,92,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 80% 70%, rgba(99,102,241,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%);
      animation: bgPulse 8s ease-in-out infinite alternate;
      pointer-events: none;
    }
    @keyframes bgPulse {
      from { opacity: 0.7; }
      to   { opacity: 1; }
    }

    .card {
      position: relative;
      text-align: center;
      padding: 64px 72px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 28px;
      backdrop-filter: blur(20px);
      box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
      animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) forwards;
      max-width: 560px;
      width: 90vw;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,56,92,0.15);
      border: 1px solid rgba(255,56,92,0.35);
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      color: #ff385c;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 28px;
    }
    .badge-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #ff385c;
      animation: blink 1.2s ease-in-out infinite;
    }
    @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }

    h1 {
      font-size: clamp(2.8rem, 6vw, 4.2rem);
      font-weight: 900;
      letter-spacing: -1px;
      line-height: 1.1;
      background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    h1 span {
      background: linear-gradient(135deg, #ff385c, #e11d48);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 15px;
      color: rgba(255,255,255,0.45);
      font-weight: 400;
      margin-top: 14px;
      margin-bottom: 48px;
      line-height: 1.6;
    }

    /* Progress bar */
    .progress-wrap {
      width: 100%;
      height: 3px;
      background: rgba(255,255,255,0.08);
      border-radius: 100px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #ff385c, #6366f1);
      border-radius: 100px;
      width: 0%;
      animation: fill 4s linear forwards;
    }
    @keyframes fill { from { width: 0%; } to { width: 100%; } }

    .redirect-text {
      font-size: 13px;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.3px;
    }
    .redirect-text strong {
      color: rgba(255,255,255,0.7);
      font-weight: 600;
    }
    #countdown {
      display: inline-block;
      min-width: 14px;
      font-variant-numeric: tabular-nums;
      color: #ff385c;
      font-weight: 700;
    }

    /* Floating orbs */
    .orb {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(80px);
      opacity: 0.12;
      animation: drift 12s ease-in-out infinite alternate;
    }
    .orb1 { width:400px;height:400px; background:#ff385c; top:-100px; left:-100px; animation-delay:0s; }
    .orb2 { width:500px;height:500px; background:#6366f1; bottom:-150px; right:-150px; animation-delay:3s; }
    @keyframes drift { from { transform: translate(0,0); } to { transform: translate(40px, 30px); } }
  </style>
</head>
<body>
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>

  <div class="card">
    <div class="badge"><span class="badge-dot"></span>Airbnb Clone API</div>
    <h1>HI <span>MENTOR</span> 👋</h1>
    <p class="subtitle">
      Backend NestJS · PostgreSQL · BullMQ · Redis<br/>
      Chào mừng mentor ghé thăm dự án cuối khóa của em!
    </p>

    <div class="progress-wrap">
      <div class="progress-bar"></div>
    </div>
    <p class="redirect-text">
      Đang chuyển hướng đến <strong>/swagger</strong> sau <strong><span id="countdown">3</span>s</strong>…
    </p>
  </div>

  <script>
    let t = 3;
    const el = document.getElementById('countdown');
    const iv = setInterval(() => {
      t--;
      el.textContent = t;
      if (t <= 0) { clearInterval(iv); window.location.href = '/swagger'; }
    }, 1000);
  </script>
</body>
</html>`;
  }
}
