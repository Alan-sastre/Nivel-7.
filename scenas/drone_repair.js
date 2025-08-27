class DroneRepairScene extends Phaser.Scene {
  constructor() {
    super({ key: "DroneRepairScene" });
    this.isMobile = false;
    this.communicationFixed = false;

    // Parámetros del sistema de comunicación
    this.antennaAngle = 45; // 0-90 grados
    this.signalPower = 50; // 0-100%
    this.encodingLevel = 50; // 0-100%

    // Valores óptimos para una comunicación exitosa
    this.optimalAngle = 75;
    this.optimalPower = 85;
    this.optimalEncoding = 70;

    // Tolerancia para considerar valores correctos
    this.tolerance = 8;

    this.signalQuality = 0;
    this.messagesSent = 0;
    this.maxMessages = 1;
    this.startTime = 0;
    // Tiempo removido
  }

  preload() {
    // Cargar assets necesarios
    this.load.image("space_bg", "assets/drones/1.jpg");
    this.load.image("satellite", "assets/drones/1.png");
  }

  create() {
    // Detectar si es móvil
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Crear fondo espacial
    this.createSpaceBackground();

    // Crear título
    this.createTitle();

    // Crear satélite
    this.createSatellite();

    // Crear panel de control de comunicaciones
    this.createCommunicationPanel();

    // Crear controles de parámetros
    this.createParameterControls();

    // Crear panel de estado
    this.createStatusPanel();

    // Temporizador removido

    // Iniciar animaciones de fondo
    this.startBackgroundAnimations();

    // Actualizar calidad de señal inicial
    this.updateSignalQuality();
  }

  createSpaceBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo espacial
    this.add
      .image(0, 0, "space_bg")
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setTint(0x000033);

    // Overlay oscuro
    this.add.graphics().fillStyle(0x000000, 0.6).fillRect(0, 0, width, height);

    // Crear estrellas animadas
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      this.stars.push(star);
    }
  }

  createTitle() {
    const centerX = this.cameras.main.centerX;

    // Título principal
    this.titleText = this.add
      .text(centerX, 40, "REPARACIÓN DEL SISTEMA DE COMUNICACIONES", {
        fontSize: this.isMobile ? "16px" : "22px",
        fill: "#00ffff",
        fontFamily: "Arial Bold",
        stroke: "#000033",
        strokeThickness: 3,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#00ffff",
          blur: 15,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // Subtítulo
    this.subtitleText = this.add
      .text(
        centerX,
        65,
        "📡 Configura los parámetros para restablecer la conexión con la flota",
        {
          fontSize: this.isMobile ? "10px" : "12px",
          fill: "#ffffff",
          fontFamily: "Arial",
          alpha: 0.8,
        }
      )
      .setOrigin(0.5);

    // Animación del título
    this.tweens.add({
      targets: this.titleText,
      scaleX: { from: 0.9, to: 1.05 },
      scaleY: { from: 0.9, to: 1.05 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createSatellite() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Contenedor del satélite
    this.satelliteContainer = this.add.container(centerX, centerY - 50);

    // Cuerpo principal del satélite
    this.satelliteBody = this.add
      .rectangle(0, 0, 80, 60, 0x555555)
      .setStrokeStyle(3, 0xaaaaaa);

    // Paneles solares
    this.solarPanel1 = this.add
      .rectangle(-60, 0, 25, 80, 0x001144)
      .setStrokeStyle(3, 0x0077dd);
    this.solarPanel2 = this.add
      .rectangle(60, 0, 25, 80, 0x001144)
      .setStrokeStyle(3, 0x0077dd);

    // Antena direccional (se moverá según el ángulo)
    this.antenna = this.add
      .circle(0, -40, 15, 0xdddddd, 0)
      .setStrokeStyle(4, 0xffffff);

    // Receptor de la antena
    this.antennaReceiver = this.add.circle(0, -40, 4, 0xffaa00);

    // Luces indicadoras de estado
    this.statusLight1 = this.add.circle(-20, -10, 4, 0xff0000); // Rojo = problema
    this.statusLight2 = this.add.circle(0, -10, 4, 0xffff00); // Amarillo = trabajando
    this.statusLight3 = this.add.circle(20, -10, 4, 0xff0000); // Rojo = problema

    // Agregar elementos al contenedor
    this.satelliteContainer.add([
      this.solarPanel1,
      this.solarPanel2,
      this.satelliteBody,
      this.antenna,
      this.antennaReceiver,
      this.statusLight1,
      this.statusLight2,
      this.statusLight3,
    ]);

    // Animación de rotación suave
    this.tweens.add({
      targets: this.satelliteContainer,
      rotation: Math.PI * 2,
      duration: 20000,
      repeat: -1,
      ease: "Linear",
    });
  }

  createCommunicationPanel() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Panel principal de comunicaciones
    const panelX = width - 280;
    const panelY = 100;

    this.commPanel = this.add
      .rectangle(panelX, panelY, 260, 400, 0x001122, 0.9)
      .setStrokeStyle(3, 0x0066cc)
      .setOrigin(0, 0);

    // Título del panel
    this.add
      .text(panelX + 130, panelY + 20, "SISTEMA DE COMUNICACIONES", {
        fontSize: this.isMobile ? "12px" : "14px",
        fill: "#00ffff",
        fontFamily: "Arial Bold",
      })
      .setOrigin(0.5);
  }

  createParameterControls() {
    const width = this.cameras.main.width;
    const panelX = width - 270;
    let currentY = 150;

    // Control de Ángulo de Antena
    this.createSliderControl(
      panelX,
      currentY,
      "🎯 ANTENA DIRECCIONAL",
      "Ángulo: ",
      "°",
      this.antennaAngle,
      0,
      90,
      (value) => {
        this.antennaAngle = value;
        this.updateAntennaRotation();
        this.updateSignalQuality();
      }
    );

    currentY += 100;

    // Control de Potencia de Señal
    this.createSliderControl(
      panelX,
      currentY,
      "⚡ AMPLIFICADOR DE SEÑAL",
      "Potencia: ",
      "%",
      this.signalPower,
      0,
      100,
      (value) => {
        this.signalPower = value;
        this.updateSignalQuality();
      }
    );

    currentY += 100;

    // Control de Codificación
    this.createSliderControl(
      panelX,
      currentY,
      "🔐 CODIFICADOR DIGITAL",
      "Nivel: ",
      "%",
      this.encodingLevel,
      0,
      100,
      (value) => {
        this.encodingLevel = value;
        this.updateSignalQuality();
      }
    );
  }

  createSliderControl(
    x,
    y,
    title,
    label,
    unit,
    initialValue,
    min,
    max,
    callback
  ) {
    // Título del control
    this.add
      .text(x + 130, y, title, {
        fontSize: this.isMobile ? "11px" : "12px",
        fill: "#ffffff",
        fontFamily: "Arial Bold",
      })
      .setOrigin(0.5);

    // Etiqueta y valor
    const valueText = this.add.text(
      x + 20,
      y + 25,
      `${label}${initialValue}${unit}`,
      {
        fontSize: this.isMobile ? "10px" : "11px",
        fill: "#ffff00",
        fontFamily: "Arial",
      }
    );

    // Barra del slider
    const sliderBg = this.add
      .rectangle(x + 20, y + 50, 200, 8, 0x333333)
      .setOrigin(0, 0.5)
      .setInteractive();

    // Handle del slider
    const handle = this.add
      .circle(x + 20 + (initialValue / max) * 200, y + 50, 8, 0x00ffff)
      .setInteractive({ draggable: true });

    // Eventos del slider
    handle.on("drag", (pointer, dragX) => {
      const clampedX = Phaser.Math.Clamp(dragX, x + 20, x + 220);
      handle.x = clampedX;

      const value = Math.round(((clampedX - x - 20) / 200) * (max - min) + min);
      valueText.setText(`${label}${value}${unit}`);

      callback(value);
    });

    // Click en la barra para mover el handle
    sliderBg.on("pointerdown", (pointer) => {
      const localX = pointer.x - x - 20;
      const clampedX = Phaser.Math.Clamp(localX, 0, 200);
      handle.x = x + 20 + clampedX;

      const value = Math.round((clampedX / 200) * (max - min) + min);
      valueText.setText(`${label}${value}${unit}`);

      callback(value);
    });
  }

  createStatusPanel() {
    const panelX = 20;
    const panelY = 100;

    this.statusPanel = this.add
      .rectangle(panelX, panelY, 250, 300, 0x001122, 0.9)
      .setStrokeStyle(3, 0x0066cc)
      .setOrigin(0, 0);

    // Título del panel
    this.add
      .text(panelX + 125, panelY + 20, "ESTADO DE LA MISIÓN", {
        fontSize: this.isMobile ? "12px" : "14px",
        fill: "#00ffff",
        fontFamily: "Arial Bold",
      })
      .setOrigin(0.5);

    // Calidad de señal
    this.signalQualityText = this.add.text(
      panelX + 20,
      panelY + 50,
      "Calidad de Señal: 0%",
      {
        fontSize: this.isMobile ? "10px" : "11px",
        fill: "#ffffff",
        fontFamily: "Arial",
      }
    );

    // Barra de calidad de señal
    this.signalBar = this.add
      .rectangle(panelX + 20, panelY + 75, 0, 15, 0xff0000)
      .setOrigin(0, 0);

    // Mensajes enviados
    this.messagesText = this.add.text(
      panelX + 20,
      panelY + 110,
      "Mensajes Enviados: 0/1",
      {
        fontSize: this.isMobile ? "10px" : "11px",
        fill: "#ffffff",
        fontFamily: "Arial",
      }
    );

    // Estado de componentes
    this.antennaStatusText = this.add.text(
      panelX + 20,
      panelY + 140,
      "🎯 Antena: ❌ Desalineada",
      {
        fontSize: this.isMobile ? "9px" : "10px",
        fill: "#ff6666",
        fontFamily: "Arial",
      }
    );

    this.powerStatusText = this.add.text(
      panelX + 20,
      panelY + 160,
      "⚡ Potencia: ❌ Insuficiente",
      {
        fontSize: this.isMobile ? "9px" : "10px",
        fill: "#ff6666",
        fontFamily: "Arial",
      }
    );

    this.encodingStatusText = this.add.text(
      panelX + 20,
      panelY + 180,
      "🔐 Codificación: ❌ Débil",
      {
        fontSize: this.isMobile ? "9px" : "10px",
        fill: "#ff6666",
        fontFamily: "Arial",
      }
    );

    // Botón de enviar mensaje
    this.sendButton = this.add
      .rectangle(panelX + 125, panelY + 220, 180, 40, 0x666666)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x999999);

    this.sendButtonText = this.add
      .text(panelX + 125, panelY + 220, "📡 ENVIAR MENSAJE", {
        fontSize: this.isMobile ? "10px" : "11px",
        fill: "#cccccc",
        fontFamily: "Arial Bold",
      })
      .setOrigin(0.5);

    this.sendButton.on("pointerdown", () => {
      this.sendMessage();
    });

    this.sendButton.on("pointerover", () => {
      if (this.signalQuality >= 70) {
        this.sendButton.setFillStyle(0x00aa00);
        this.sendButtonText.setFill("#ffffff");
      }
    });

    this.sendButton.on("pointerout", () => {
      if (this.signalQuality >= 70) {
        this.sendButton.setFillStyle(0x00ff00);
      } else {
        this.sendButton.setFillStyle(0x666666);
      }
      this.sendButtonText.setFill("#cccccc");
    });
  }

  // Función de timer removida

  updateAntennaRotation() {
    // Rotar la antena según el ángulo configurado
    const radians = Phaser.Math.DegToRad(this.antennaAngle - 45);
    this.antenna.setRotation(radians);
    this.antennaReceiver.setRotation(radians);
  }

  updateSignalQuality() {
    // Calcular la calidad de señal basada en qué tan cerca están los valores de los óptimos
    const angleDiff = Math.abs(this.antennaAngle - this.optimalAngle);
    const powerDiff = Math.abs(this.signalPower - this.optimalPower);
    const encodingDiff = Math.abs(this.encodingLevel - this.optimalEncoding);

    const antennaScore = Math.max(0, 100 - (angleDiff / this.tolerance) * 100);
    const powerScore = Math.max(0, 100 - (powerDiff / this.tolerance) * 100);
    const encodingScore = Math.max(
      0,
      100 - (encodingDiff / this.tolerance) * 100
    );

    this.signalQuality = Math.round(
      (antennaScore + powerScore + encodingScore) / 3
    );

    // Actualizar UI
    this.signalQualityText.setText(`Calidad de Señal: ${this.signalQuality}%`);

    // Actualizar barra de calidad
    const barWidth = (this.signalQuality / 100) * 210;
    this.signalBar.setSize(barWidth, 15);

    // Color de la barra según calidad
    if (this.signalQuality >= 80) {
      this.signalBar.setFillStyle(0x00ff00);
    } else if (this.signalQuality >= 50) {
      this.signalBar.setFillStyle(0xffff00);
    } else {
      this.signalBar.setFillStyle(0xff0000);
    }

    // Actualizar estado de componentes
    const antennaOK = angleDiff <= this.tolerance;
    const powerOK = powerDiff <= this.tolerance;
    const encodingOK = encodingDiff <= this.tolerance;

    this.antennaStatusText.setText(
      `🎯 Antena: ${antennaOK ? "✅ Alineada" : "❌ Desalineada"}`
    );
    this.antennaStatusText.setFill(antennaOK ? "#66ff66" : "#ff6666");

    this.powerStatusText.setText(
      `⚡ Potencia: ${powerOK ? "✅ Óptima" : "❌ Insuficiente"}`
    );
    this.powerStatusText.setFill(powerOK ? "#66ff66" : "#ff6666");

    this.encodingStatusText.setText(
      `🔐 Codificación: ${encodingOK ? "✅ Segura" : "❌ Débil"}`
    );
    this.encodingStatusText.setFill(encodingOK ? "#66ff66" : "#ff6666");

    // Actualizar luces del satélite
    this.statusLight1.setFillStyle(antennaOK ? 0x00ff00 : 0xff0000);
    this.statusLight2.setFillStyle(powerOK ? 0x00ff00 : 0xffff00);
    this.statusLight3.setFillStyle(encodingOK ? 0x00ff00 : 0xff0000);

    // Actualizar botón de envío
    if (this.signalQuality >= 70) {
      this.sendButton.setFillStyle(0x00ff00);
      this.sendButtonText.setFill("#ffffff");
    } else {
      this.sendButton.setFillStyle(0x666666);
      this.sendButtonText.setFill("#cccccc");
    }
  }

  sendMessage() {
    if (this.signalQuality < 70) {
      this.showFeedback("❌ Señal muy débil. Ajusta los parámetros.", 0xff0000);
      return;
    }

    this.messagesSent++;
    this.messagesText.setText(`Mensajes Enviados: ${this.messagesSent}/1`);

    this.showFeedback(
      `✅ Mensaje ${this.messagesSent} enviado exitosamente!`,
      0x00ff00
    );

    // Vibración en móviles
    if (this.isMobile && navigator.vibrate) {
      navigator.vibrate(200);
    }

    if (this.messagesSent >= this.maxMessages) {
      this.completeMission();
    }
  }

  showFeedback(message, color) {
    if (this.feedbackText) {
      this.feedbackText.destroy();
    }

    this.feedbackText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 100,
        message,
        {
          fontSize: this.isMobile ? "12px" : "14px",
          fill: Phaser.Display.Color.IntegerToColor(color).rgba,
          fontFamily: "Arial Bold",
          stroke: "#000000",
          strokeThickness: 2,
        }
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.feedbackText,
      alpha: { from: 1, to: 0 },
      y: this.feedbackText.y - 50,
      duration: 3000,
      onComplete: () => {
        this.feedbackText.destroy();
      },
    });
  }

  completeMission() {
    this.communicationFixed = true;

    // Mostrar mensaje de éxito
    const successText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "🎉 ¡MISIÓN COMPLETADA!\n\n📡 La señal del satélite se ha restablecido!\nAhora podemos recibir datos de la misión.",
        {
          fontSize: this.isMobile ? "16px" : "20px",
          fill: "#00ff00",
          fontFamily: "Arial Bold",
          align: "center",
          stroke: "#000000",
          strokeThickness: 3,
          shadow: {
            offsetX: 0,
            offsetY: 0,
            color: "#00ff00",
            blur: 20,
            fill: true,
          },
        }
      )
      .setOrigin(0.5);

    // Animación de éxito
    this.tweens.add({
      targets: successText,
      scale: { from: 0.5, to: 1.2 },
      duration: 1000,
      yoyo: true,
      repeat: 2,
      ease: "Back.easeOut",
    });

    // Continuar después de 5 segundos
    this.time.delayedCall(5000, () => {
      this.scene.start("scenaVideo2");
    });
  }

  startBackgroundAnimations() {
    // Animación de estrellas
    this.stars.forEach((star, index) => {
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: Phaser.Math.FloatBetween(0.1, 1) },
        duration: Phaser.Math.Between(1000, 3000),
        delay: index * 50,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  // Función update removida (sin temporizador)

  // Función gameOver removida (sin límite de tiempo)

  createMobileControls() {
    // Controles adicionales para móviles si es necesario
    if (this.isMobile) {
      // Ajustar tamaños y posiciones para móviles
    }
  }
}
