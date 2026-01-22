document.addEventListener("DOMContentLoaded", () => {

  /* CONSTANTS I ESTAT */

  const CLAU_STORAGE = "dibuixa_moviment_dades";

  const CONFIG_DEFECTE = {
    llindarMoviment: 20
  };

  let config = { ...CONFIG_DEFECTE };

  let movimentsAvui = 0;
  let darrerMoviment = 0;

  let intensitatMoviment = 0;
  let direccioX = 0;
  let direccioY = 0;

  
  let modeAnimacio = "formes"; 

  /* ELEMENTS DEL DOM */

  const comptadorMoviments = document.getElementById("comptadorMoviments");
  const ubicacioText = document.getElementById("ubicacioText");
  const dataText = document.getElementById("dataAvui");

  const btnConfig = document.getElementById("btnConfig");
  const btnCaptura = document.getElementById("btnCaptura");
  const btnCanviAnimacio = document.getElementById("btnCanviAnimacio");

  const panelConfig = document.getElementById("configPanel");
  const overlay = document.getElementById("overlay");
  const inputLlindar = document.getElementById("inputLlindar");
  const btnTancarConfig = document.getElementById("closeConfig");

  /* CONFIGURACIÓ */

  function carregarConfiguracio() {
    const dades = JSON.parse(localStorage.getItem(CLAU_STORAGE));
    if (dades) config = { ...CONFIG_DEFECTE, ...dades };
    inputLlindar.value = config.llindarMoviment;
  }

  function desarConfiguracio() {
    localStorage.setItem(CLAU_STORAGE, JSON.stringify(config));
  }

  /* SENSOR DE MOVIMENT (CAPACITOR) */

  async function iniciarSensorMoviment() {
    try {
      const { Motion } = await import("@capacitor/motion");

      Motion.addListener("accel", (event) => {
        const acc = event.acceleration;
        if (!acc) return;

        intensitatMoviment =
          Math.abs(acc.x || 0) +
          Math.abs(acc.y || 0) +
          Math.abs(acc.z || 0);

        direccioX = acc.x || 0;
        direccioY = acc.y || 0;

        const ara = Date.now();

        if (
          intensitatMoviment > config.llindarMoviment &&
          ara - darrerMoviment > 500
        ) {
          darrerMoviment = ara;
          movimentsAvui++;
          comptadorMoviments.textContent = movimentsAvui;
        }
      });

    } catch (error) {
      console.warn("Sensor de moviment no disponible", error);
    }
  }

  /*  GEOLOCALITZACIÓ (API EXTERNA) */

  navigator.geolocation?.getCurrentPosition(
    pos => {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
      )
        .then(r => r.json())
        .then(d => {
          ubicacioText.textContent =
            d.address?.city ||
            d.address?.town ||
            d.address?.village ||
            "Ubicació desconeguda";
        });
    },
    () => {
      ubicacioText.textContent = "Ubicació no disponible";
    }
  );

  /* ANIMACIÓ GENERATIVA (p5.js) */

  new p5((p) => {
    let formes = [];
    let faseColor = 0;

    p.setup = () => {
      p.createCanvas(
        document.getElementById("canvasWrapper").clientWidth,
        320
      ).parent("canvasWrapper");
      p.colorMode(p.HSB);
    };

    p.draw = () => {
      p.background(0, 35);

      if (modeAnimacio === "formes") {
        /* MODE ORIGINAL */
        const quantitat = p.map(intensitatMoviment, 0, 60, 1, 8, true);

        for (let i = 0; i < quantitat; i++) {
          formes.push({
            x: p.width / 2,
            y: p.height / 2,
            vx: direccioX * p.random(2, 6),
            vy: direccioY * p.random(2, 6),
            mida: p.random(6, 16),
            tipus: Math.abs(direccioX) > Math.abs(direccioY) ? "linia" : "cercle",
            color: p.color(p.random(360), 80, 100)
          });
        }

        formes.forEach(f => {
          p.stroke(f.color);
          p.fill(f.color);

          if (f.tipus === "linia") {
            p.line(f.x, f.y, f.x + f.vx * 4, f.y);
          } else {
            p.circle(f.x, f.y, f.mida);
          }

          f.x += f.vx;
          f.y += f.vy;
        });

        formes = formes.filter(f =>
          f.x > -50 && f.x < p.width + 50 &&
          f.y > -50 && f.y < p.height + 50
        );

      } else {
        /* ANIMACIÓ DEGRADAT  */
        faseColor += intensitatMoviment * 0.02;

        const sentit = Math.abs(direccioX) > Math.abs(direccioY)
          ? "horitzontal"
          : "vertical";

        for (let i = 0; i < 40; i++) {
          const to = i / 40;
          const h = (faseColor + i * 8) % 360;

          p.stroke(h, 80, 100);

          if (sentit === "horitzontal") {
            p.line(
              p.width * to,
              0,
              p.width * (1 - to),
              p.height
            );
          } else {
            p.line(
              0,
              p.height * to,
              p.width,
              p.height * (1 - to)
            );
          }
        }
      }
    };
  });

  /* CAPTURA DEL MOVIMENT (FA UN CAPTURA...) */

  btnCaptura.onclick = () => {
    const canvas = document.querySelector("#canvasWrapper canvas");
    if (!canvas) return;

    const imatge = canvas.toDataURL("image/png");

    const visor = document.createElement("div");
    visor.style.position = "fixed";
    visor.style.inset = "0";
    visor.style.background = "rgba(0,0,0,0.9)";
    visor.style.display = "flex";
    visor.style.flexDirection = "column";
    visor.style.alignItems = "center";
    visor.style.justifyContent = "center";
    visor.style.zIndex = "9999";

    visor.innerHTML = `
      <img src="${imatge}" style="max-width:90%; border-radius:12px;" />
      <button style="
        margin-top:16px;
        padding:12px 20px;
        border:none;
        border-radius:12px;
        background:#2563eb;
        color:white;
        font-size:15px;
      ">Tancar</button>
    `;

    visor.querySelector("button").onclick = () => visor.remove();
    document.body.appendChild(visor);
  };

  /* CANVI D’ANIMACIÓ + VIBRACIÓ */

  btnCanviAnimacio.onclick = async () => {
    modeAnimacio = modeAnimacio === "formes" ? "degradat" : "formes";

    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      navigator.vibrate?.(60);
    }
  };

  /* UI CONFIGURACIÓ */

  btnConfig.onclick = () => {
    panelConfig.classList.add("show");
    overlay.classList.add("show");
  };

  btnTancarConfig.onclick = () => {
    panelConfig.classList.remove("show");
    overlay.classList.remove("show");
  };

  overlay.onclick = btnTancarConfig.onclick;

  inputLlindar.oninput = () => {
    config.llindarMoviment = Number(inputLlindar.value);
    desarConfiguracio();
  };

  /* INICI */

  dataText.textContent = new Date().toLocaleDateString("ca-ES");
  carregarConfiguracio();
  iniciarSensorMoviment();

});

