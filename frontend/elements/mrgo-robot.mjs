export const ELEMENT_NAME = 'mrgo-robot';

/** @type {import('@enhance/types').EnhanceElemFn} */
export function element({ html }) {
  return html`
    <style>
      .art-container {
        width: 256px;
        height: 256px;
        position: relative;
      }
      .mrgo-hat-top {
        position: absolute;
        height: 64px;
        width: 224px;
        left: 12px;
        top: 0px;
        z-index: 1;
        background-color: #5f3721;
        border-radius: 16px 16px 0 0;
        border: 4px solid black;
        display: flex;
        align-items: center;
      }
      .mrgo-hat-text {
        width: 100%;
        text-align: center;
        color: #bbff00;
        font-weight: bolder;
        font-size: 32px;
      }
      .mrgo-hat-bottom {
        position: absolute;
        height: 24px;
        width: 248px;
        left: 0%;
        top: 64px;
        z-index: 1;
        background-color: #5f3721;
        border-radius: 16px 16px 16px 16px;
        border: 4px solid black;
      }
      .mrgo-head {
        position: absolute;
        width: 208px;
        height: 208px;
        left: 20px;
        top: 20px;
        background-color: #3C877B;
        border-radius: 16px 16px 16px 16px;
        border: 4px solid black;
      }
      .mrgo-head::after {
        content: '';
        position: absolute;
        width: 208px;
        height: 208px;
        box-shadow: inset -8px -8px 4px 4px rgba(0,0,0,0.2);
      }
      .mrgo-eyes {
        position: absolute;
        width: 28px;
        height: 28px;
        top: 92px;
        background-color: #FFF;
        border-radius: 8px 8px 8px 8px;
        border: 4px solid black;
      }
      .mrgo-eye-left {
        left: 32px;
      }
      .mrgo-eye-right {
        right: 32px;
      }
      .mrgo-pupil {
        position: absolute;
        width: 16px;
        height: 16px;
        left: 0px;
        top: 0px;
        background-color: #000;
        border-radius: 2px 2px 2px 2px;
        animation: look-around 10s ease-in-out forwards infinite;
      }
      .art-container:hover .mrgo-pupil {
        animation-play-state: paused;
      }

      @keyframes look-around {
        0% { transform: translateX(0px) translateY(0px); }
        10% { transform: translateX(12px) translateY(0px); }
        20% { transform: translateX(0px) translateY(12px); }
        30% { transform: translateX(0px) translateY(0px); }
        40% { transform: translateX(12px) translateY(12px); }
        50% { transform: translateX(12px) translateY(0px); }
        60% { transform: translateX(0px) translateY(12px); }
        70% { transform: translateX(0px) translateY(0px); }
        80% { transform: translateX(12px) translateY(0px); }
        90% { transform: translateX(0px) translateY(12px); }
        100% { transform: translateX(0px) translateY(0px); }
      }

      .mrgo-mustache {
        width: 24px;
        height: 24px;
        left: 0px;
        border-radius: 50%;
        position: absolute;
        color: black;
        box-shadow:
          80px 128px 0 0 currentColor,
          104px 128px 0 0 currentColor;
      }
      .mrgo-mustache::before{
        content: '';
        position: absolute;
        left: 49px;
        top: 104px;
        width: 42px;
        height: 24px;
        border-bottom: solid 24px currentColor;
        border-radius: 0 0 0 100%;
        transform: rotate(-40deg);
        transform-origin: right 34px;
        animation: mustache-wiggle-left 1000ms ease-in-out forwards infinite;
      }
      .mrgo-mustache::after {
        content: '';
        position: absolute;
        left: 117px;
        top: 104px;
        width: 42px;
        height: 24px;
        border-bottom: solid 24px currentColor;
        border-radius: 0 0 100%;
        transform: rotate(40deg);
        transform-origin: left 34px;
        animation: mustache-wiggle-right 1000ms ease-in-out forwards infinite;
      }
      @keyframes mustache-wiggle-left {
        0% { transform: rotate(-40deg); }
        50% { transform: rotate(-60deg); }
        100% { transform: rotate(-40deg); }
      }
      @keyframes mustache-wiggle-right {
        0% { transform: rotate(40deg); }
        50% { transform: rotate(60deg); }
        100% { transform: rotate(40deg); }
      }

      .mrgo-mouth {
        position: absolute;
        width: 160px;
        height: 24px;
        top: 164px;
        left: 20px;
        border: 4px solid black;
        border-radius: 0 0 16px 16px;
        background-color: #FFF;
        background-image:
          linear-gradient(to right, #000 2px, transparent 0px),
          linear-gradient(to bottom, #000 2px, transparent 0px);
        background-size: 16px 16px;
        background-position: 8px 27px;
      }

      .mrgo-ear {
        position: absolute;
        background-color: #FF0;
        width: 8px;
        height: 48px;
        top: 100px;
        border: 4px solid black;
        animation: ear-wiggles 4s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards infinite;
      }
      .mrgo-ear-left {
        left: 8px;
        border-radius: 16px 0 0 16px;
      }
      .mrgo-ear-right {
        left: 232px;
        border-radius: 0 16px 16px 0;
      }
      @keyframes ear-wiggles {
        0% { transform: translateX(0px) translateY(0px); }
        50% { transform: translateX(0px) translateY(12px); }
        100% { transform: translateX(0px) translateY(0px); }
      }
    </style>

    <div class="art-container">
      <div class="mrgo-hat-top">
        <span class="mrgo-hat-text">Mr. Go</span>
      </div>
      <div class="mrgo-hat-bottom"></div>
      <div class="mrgo-ear mrgo-ear-left"></div>
      <div class="mrgo-head">
        <div class="mrgo-eyes mrgo-eye-left">
          <div class="mrgo-pupil"></div>
        </div>
        <div class="mrgo-eyes mrgo-eye-right">
          <div class="mrgo-pupil"></div>
        </div>
        <div class="mrgo-mustache"></div>
        <div class="mrgo-mouth"></div>
      </div>
      <div class="mrgo-ear mrgo-ear-right"></div>
    </div>
  `;
}
