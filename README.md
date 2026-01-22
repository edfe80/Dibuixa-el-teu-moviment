\# Dibuixa el teu moviment


Aquesta aplicació és un \*\*restyling i replantejament funcional\*\* del projecte inicial

\*\*“El teu pas”\*\*, desenvolupat a la PR1.


Després d’analitzar les limitacions de la detecció fiable de passos mitjançant sensors

d’acceleració, el projecte ha evolucionat cap a una nova idea més adequada a les dades

proporcionades pel dispositiu: \*\*la visualització creativa i reactiva del moviment\*\*

---


\## Objectiu de l’aplicació



L’objectiu principal de l’app és \*\*experimentar amb la lectura del sensor de moviment del dispositiu\*\* i transformar aquestes dades en una \*\*visualització gràfica interactiva\*\*, prioritzant:



\- Reacció immediata al moviment  

\- Feedback visual clar  

\- Simplicitat d’ús  

\- Experiència creativa i exploratòria  


---


\## Funcionalitats principals



\### Lectura del moviment (Capacitor Motion)

\- Ús del \*\*plugin natiu `@capacitor/motion`\*\*

\- Lectura contínua de l’acceleròmetre

\- Detecció d’intensitat i direcció del moviment

&nbsp;-Ús del plugin natiu @capacitor/haptics per la vibracio





\### Animació generativa amb p5.js

\- Animació reactiva en temps real

\- Formes diferents segons el gest:

&nbsp; - Línies per moviment horitzontal

&nbsp; - Cercles per moviment vertical

\- Colors dinàmics amb mode HSB



\### Sensibilitat configurable

\- Panell de configuració inferior

\- Slider per ajustar la sensibilitat del moviment

\- Canvis perceptibles immediatament



\###  Captura del moviment

\- Botó per capturar l’animació

\- Generació d’una imatge PNG del canvas

\- Visualització en una nova finestra per poder-la guardar



\### Ubicació actual (API externa)

\- Ús de l’API pública \*\*Nominatim (OpenStreetMap)\*\*

\- Mostra de la ubicació aproximada de l’usuari


---

\## Execució del projecte


npm install

npm run dev

npx cap sync

npx cap open android

```

---






