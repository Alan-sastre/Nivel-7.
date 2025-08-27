class Rompecabezas extends Phaser.Scene {
  constructor() {
    super({ key: "Rompecabezas" });
    this.satellites = [];
    this.selectedSatellite = null;
    this.currentSatellite = -1;
    this.timeLimit = 120000; // 2 minutos
    this.timeRemaining = this.timeLimit;

    // Parámetros de configuración
    this.frequency = 2400;
    this.signalPower = 50;

    // Valores objetivo (se generarán aleatoriamente para cada satélite)
    this.optimalFrequency = 2475;
    this.optimalPower = 85;
    this.tolerance = 30;

    // Objetivos aleatorios para cada satélite
    this.satelliteObjectives = [];

    // Estado del juego
    this.satellitesConfigured = 0;
    this.totalSatellites = 2;
    this.gameCompleted = false;
    this.congratulationsShown = false;

    // Variables de estado adicionales
    this.interference = 0;
    this.networkQuality = 0;
  }

  preload() {
    // Las imágenes se cargarán desde los assets existentes
  }

  create() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Generar objetivos aleatorios para cada satélite
    this.generateRandomObjectives();

    // Fondo espacial
    this.createSpaceBackground();

    // Título del juego
    this.add
      .text(width / 2, 40, "🛰️ CONFIGURACIÓN DE SATÉLITES", {
        fontSize: "28px",
        fill: "#00ddff",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
      })
      .setOrigin(0.5);

    // Instrucciones simples
    this.add
      .text(
        width / 2,
        80,
        "Haz clic en un satélite y ajusta sus valores para establecer comunicación",
        {
          fontSize: "16px",
          fill: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }
      )
      .setOrigin(0.5);

    // Crear los 2 satélites
    this.createSatellites();

    // Panel de control interactivo
    this.createInteractivePanel();

    // Panel de estado
    this.createStatusPanel();

    // Temporizador
    this.createTimer();

    // Iniciar juego
    this.startGame();
  }

  generateRandomObjectives() {
    // Generar objetivos aleatorios para cada satélite
    // Los valores deben ser alcanzables con los botones (+/-25 MHz, +/-5 W)
    for (let i = 0; i < this.totalSatellites; i++) {
      // Frecuencia: múltiplos de 25 entre 2400-2600 MHz
      const freqSteps = Math.floor(Math.random() * 9); // 0-8 pasos
      const frequency = 2400 + freqSteps * 25; // 2400, 2425, 2450, ..., 2600

      // Potencia: múltiplos de 5 entre 50-100 W
      const powerSteps = Math.floor(Math.random() * 11); // 0-10 pasos
      const power = 50 + powerSteps * 5; // 50, 55, 60, ..., 100

      this.satelliteObjectives.push({
        frequency: frequency,
        power: power,
      });
    }
  }

  startGame() {
    // Inicializar el temporizador
    this.startTimer();
  }

  createSpaceBackground() {
    // Fondo con gradiente espacial
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 1);
    bg.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);

    // Estrellas de fondo
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, this.sys.game.config.width),
        Phaser.Math.Between(0, this.sys.game.config.height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.8)
      );

      // Animación de parpadeo
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  createBackgroundParticles() {
    // Partículas flotantes para ambiente espacial
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, this.sys.game.config.width),
        Phaser.Math.Between(0, this.sys.game.config.height),
        Phaser.Math.Between(2, 4),
        0x00aaff,
        0.3
      );

      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-50, 50),
        y: particle.y + Phaser.Math.Between(-50, 50),
        duration: Phaser.Math.Between(8000, 12000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  createTitle() {
    const width = this.sys.game.config.width;

    const titleStyle = {
      fontSize: "32px",
      fill: "#00ddff",
      fontFamily: "Arial, sans-serif",
      align: "center",
      stroke: "#001122",
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 5, fill: true },
    };

    const subtitleStyle = {
      fontSize: "18px",
      fill: "#ffaa00",
      fontFamily: "Arial, sans-serif",
      align: "center",
      fontWeight: "bold",
    };

    this.add
      .text(width / 2, 30, "🛰️ ESTABLECIENDO RED DE COMUNICACIÓN", titleStyle)
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        65,
        "📡 Configura los satélites para optimizar la transmisión de datos",
        subtitleStyle
      )
      .setOrigin(0.5);
  }

  createSatellites() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Solo 2 satélites posicionados estratégicamente
    const positions = [
      { x: width * 0.55, y: height * 0.4, name: "ALFA" },
      { x: width * 0.8, y: height * 0.4, name: "BETA" },
    ];

    positions.forEach((pos, index) => {
      const satellite = this.createSatellite(pos.x, pos.y, index, pos.name);
      this.satellites.push(satellite);
    });

    // Línea de comunicación entre los satélites
    this.createConnectionLine();
  }

  createSatellite(x, y, index, name) {
    const container = this.add.container(x, y);

    // Fondo circular con gradiente
    const background = this.add.circle(0, 0, 85, 0x1a1a3a, 0.95);
    background.setStrokeStyle(4, 0x00ddff, 0.8);

    // Cuerpo principal del satélite (más detallado)
    const body = this.add.rectangle(0, 0, 85, 65, 0x2a2a2a);
    body.setStrokeStyle(3, 0x555555);

    // Panel frontal con detalles
    const frontPanel = this.add.rectangle(0, 0, 75, 55, 0x333333);
    frontPanel.setStrokeStyle(1, 0x666666);

    // Detalles del cuerpo mejorados
    const bodyDetail1 = this.add.rectangle(-25, -20, 18, 10, 0x444444);
    const bodyDetail2 = this.add.rectangle(25, -20, 18, 10, 0x444444);
    const bodyDetail3 = this.add.rectangle(-25, 20, 18, 10, 0x444444);
    const bodyDetail4 = this.add.rectangle(25, 20, 18, 10, 0x444444);

    // Agregar bordes a los detalles
    [bodyDetail1, bodyDetail2, bodyDetail3, bodyDetail4].forEach((detail) => {
      detail.setStrokeStyle(1, 0x666666);
    });

    // Líneas de ventilación
    const ventLine1 = this.add.rectangle(0, -10, 50, 2, 0x555555);
    const ventLine2 = this.add.rectangle(0, 0, 50, 2, 0x555555);
    const ventLine3 = this.add.rectangle(0, 10, 50, 2, 0x555555);

    // Paneles solares mejorados
    const leftPanel = this.add.rectangle(-55, 0, 35, 55, 0x003366);
    leftPanel.setStrokeStyle(2, 0x0055aa);
    const rightPanel = this.add.rectangle(55, 0, 35, 55, 0x003366);
    rightPanel.setStrokeStyle(2, 0x0055aa);

    // Líneas de los paneles solares
    const leftPanelLines = [];
    const rightPanelLines = [];
    for (let i = -20; i <= 20; i += 8) {
      leftPanelLines.push(
        this.add.line(-55, 0, -72, i, -38, i, 0x4299e1).setLineWidth(1)
      );
      rightPanelLines.push(
        this.add.line(55, 0, 38, i, 72, i, 0x4299e1).setLineWidth(1)
      );
    }

    // Antena principal elaborada
    const antennaBase = this.add.circle(0, -35, 6, 0x718096);
    const antennaRod = this.add.line(0, 0, 0, -35, 0, -55, 0xffffff);
    antennaRod.setLineWidth(4);
    const antennaDish = this.add.circle(0, -55, 15, 0xffaa00);
    antennaDish.setStrokeStyle(3, 0xffcc00);
    const antennaCenter = this.add.circle(0, -55, 4, 0xffd700);

    // Antenas secundarias
    const leftAntenna = this.add.line(0, 0, -25, -20, -40, -30, 0xcccccc);
    leftAntenna.setLineWidth(3);
    const rightAntenna = this.add.line(0, 0, 25, -20, 40, -30, 0xcccccc);
    rightAntenna.setLineWidth(3);
    const leftAntennaTip = this.add.circle(-40, -30, 3, 0xffffff);
    const rightAntennaTip = this.add.circle(40, -30, 3, 0xffffff);

    // Luz de estado grande con efecto
    const statusLight = this.add.circle(0, 10, 12, 0xff0000);
    statusLight.setStrokeStyle(3, 0xffffff);
    statusLight.name = "statusLight";

    // Efecto de pulso para la luz de estado
    this.tweens.add({
      targets: statusLight,
      alpha: 0.4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Luces indicadoras adicionales
    const indicator1 = this.add.circle(-20, 5, 3, 0x00ff00, 0.7);
    const indicator2 = this.add.circle(20, 5, 3, 0x0088ff, 0.7);

    // Nombre del satélite
    const label = this.add
      .text(0, 65, name, {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Estado del satélite
    const statusText = this.add
      .text(0, 95, "NO CONFIGURADO", {
        fontSize: "12px",
        fill: "#ff6666",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
      })
      .setOrigin(0.5);
    statusText.name = "statusText";

    // Agregar elementos que giran con el satélite
    container.add([
      background,
      body,
      frontPanel,
      bodyDetail1,
      bodyDetail2,
      bodyDetail3,
      bodyDetail4,
      ventLine1,
      ventLine2,
      ventLine3,
      leftPanel,
      rightPanel,
      ...leftPanelLines,
      ...rightPanelLines,
      antennaBase,
      antennaRod,
      antennaDish,
      antennaCenter,
      leftAntenna,
      rightAntenna,
      leftAntennaTip,
      rightAntennaTip,
      statusLight,
      indicator1,
      indicator2,
    ]);

    // Crear contenedor separado para texto que no gira
    const textContainer = this.add.container(x, y);
    textContainer.add([label, statusText]);
    textContainer.setDepth(20); // Asegurar que esté encima

    // Guardar referencia al contenedor de texto
    container.textContainer = textContainer;

    // Interactividad
    container.setSize(170, 170);
    container.setInteractive({ useHandCursor: true });

    // Efectos hover
    container.on("pointerover", () => {
      if (!container.configured) {
        background.setStrokeStyle(6, 0x00ff00, 1);
        this.tweens.add({
          targets: container,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          ease: "Power2",
        });
      }
    });

    container.on("pointerout", () => {
      if (!container.configured) {
        background.setStrokeStyle(4, 0x00ddff, 0.8);
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: "Power2",
        });
      }
    });

    container.on("pointerdown", () => this.selectSatellite(index));

    // Rotación del satélite completo como una unidad
    const rotationSpeed = 15000; // Velocidad más lenta y realista

    // Rotar todo el contenedor del satélite
    this.tweens.add({
      targets: container,
      rotation: Math.PI * 2,
      duration: rotationSpeed,
      repeat: -1,
      ease: "Linear",
    });

    // Rotación independiente de la antena principal (contra-rotación)
    this.tweens.add({
      targets: [antennaDish, antennaCenter],
      rotation: -Math.PI * 2, // Rotación opuesta para efecto realista
      duration: rotationSpeed * 0.8,
      repeat: -1,
      ease: "Linear",
    });

    // Animación de pulso para los indicadores (independiente de la rotación)
    this.tweens.add({
      targets: [indicator1, indicator2],
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Propiedades
    container.configured = false;
    container.frequency = 2400;
    container.power = 50;
    container.index = index;
    container.background = background;
    container.statusLight = statusLight;
    container.statusText = statusText;

    return container;
  }

  createConnectionLine() {
    // Línea de comunicación entre los dos satélites
    const sat1 = this.satellites[0];
    const sat2 = this.satellites[1];

    this.connectionLine = this.add.line(
      0,
      0,
      sat1.x,
      sat1.y,
      sat2.x,
      sat2.y,
      0x666666,
      0.5
    );
    this.connectionLine.setLineWidth(4);
    this.connectionLine.setDepth(-1); // Detrás de los satélites

    // Crear efectos de comunicación
    this.createCommunicationEffects();
  }

  createCommunicationEffects() {
    const sat1 = this.satellites[0];
    const sat2 = this.satellites[1];

    // Crear partículas de señal que viajan entre satélites
    this.communicationParticles = [];

    // Función para crear una partícula de señal más intensa
    const createSignalParticle = (fromSat, toSat, color) => {
      const particle = this.add.circle(fromSat.x, fromSat.y, 8, color, 1.0);
      particle.setDepth(10);

      // Efecto de brillo inicial
      particle.setStrokeStyle(3, 0xffffff, 0.8);

      // Animación de pulso durante el viaje
      this.tweens.add({
        targets: particle,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.tweens.add({
        targets: particle,
        x: toSat.x,
        y: toSat.y,
        duration: 1800,
        ease: "Power2",
        onComplete: () => {
          // Efecto de llegada más intenso
          this.tweens.add({
            targets: particle,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 400,
            onComplete: () => particle.destroy(),
          });
        },
      });

      return particle;
    };

    // Crear ondas de comunicación periódicas en rojo (sin comunicación)
    this.communicationTimer = this.time.addEvent({
      delay: 1500,
      callback: () => {
        // Crear múltiples partículas rojas indicando falta de comunicación
        for (let i = 0; i < 2; i++) {
          this.time.delayedCall(i * 400, () => {
            if (Math.random() > 0.5) {
              createSignalParticle(sat1, sat2, 0xff4444);
            } else {
              createSignalParticle(sat2, sat1, 0xff6666);
            }
          });
        }
      },
      loop: true,
    });

    // Crear ondas de radio visuales
    this.createRadioWaves();
  }

  createRadioWaves() {
    const createWave = (satellite, color) => {
      const wave = this.add.circle(satellite.x, satellite.y, 15, color, 0);
      wave.setStrokeStyle(4, color, 0.9);
      wave.setDepth(5);

      this.tweens.add({
        targets: wave,
        radius: 120,
        alpha: 0,
        duration: 2500,
        ease: "Power2",
        onComplete: () => wave.destroy(),
      });
    };

    // Ondas de radio en rojo indicando falta de comunicación
    this.radioWaveTimer = this.time.addEvent({
      delay: 2000,
      callback: () => {
        createWave(this.satellites[0], 0xff4444);
        this.time.delayedCall(300, () => {
          createWave(this.satellites[1], 0xff6666);
        });
        // Ondas adicionales en tonos rojos
        this.time.delayedCall(700, () => {
          createWave(this.satellites[0], 0xff5555);
        });
        this.time.delayedCall(1000, () => {
          createWave(this.satellites[1], 0xff3333);
        });
      },
      loop: true,
    });
  }

  updateConnectionLine() {
    if (!this.connectionLine) return;

    const sat1 = this.satellites[0];
    const sat2 = this.satellites[1];

    if (sat1.configured && sat2.configured) {
      // Línea verde cuando ambos están configurados
      this.connectionLine.setStrokeStyle(6, 0x00ff88, 1);

      // Efecto de pulso
      this.tweens.add({
        targets: this.connectionLine,
        alpha: 0.5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Intensificar efectos de comunicación
      this.intensifyCommunication();
    } else {
      // Línea gris cuando no están configurados
      this.connectionLine.setStrokeStyle(4, 0x666666, 0.5);
      this.tweens.killTweensOf(this.connectionLine);
      this.connectionLine.setAlpha(0.5);
    }
  }

  intensifyCommunication() {
    // Crear efectos más intensos cuando ambos satélites están configurados
    if (this.communicationTimer) {
      this.communicationTimer.destroy();
    }

    const sat1 = this.satellites[0];
    const sat2 = this.satellites[1];

    // Comunicación más frecuente y con múltiples partículas
    this.communicationTimer = this.time.addEvent({
      delay: 600, // Más frecuente
      callback: () => {
        // Crear múltiples partículas de datos más intensas
        for (let i = 0; i < 4; i++) {
          this.time.delayedCall(i * 150, () => {
            const fromSat = Math.random() > 0.5 ? sat1 : sat2;
            const toSat = fromSat === sat1 ? sat2 : sat1;
            const colors = [0x00ff88, 0x0088ff, 0xffaa00, 0xff4488];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const particle = this.add.circle(
              fromSat.x,
              fromSat.y,
              10,
              color,
              1.0
            ); // Más grande y opaco
            particle.setDepth(15);

            // Efecto de brillo más intenso
            particle.setStrokeStyle(4, 0xffffff, 1.0);

            // Animación de pulso durante el viaje
            this.tweens.add({
              targets: particle,
              scaleX: 1.5,
              scaleY: 1.5,
              duration: 150,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });

            this.tweens.add({
              targets: particle,
              x: toSat.x,
              y: toSat.y,
              duration: 1200, // Más rápido
              ease: "Power2",
              onComplete: () => {
                // Efecto de explosión más intenso al llegar
                for (let j = 0; j < 8; j++) {
                  const spark = this.add.circle(
                    toSat.x + Phaser.Math.Between(-20, 20),
                    toSat.y + Phaser.Math.Between(-20, 20),
                    4,
                    color,
                    1.0
                  );
                  spark.setStrokeStyle(2, 0xffffff, 0.8);
                  this.tweens.add({
                    targets: spark,
                    alpha: 0,
                    scaleX: 0.2,
                    scaleY: 0.2,
                    x: spark.x + Phaser.Math.Between(-30, 30),
                    y: spark.y + Phaser.Math.Between(-30, 30),
                    duration: 800,
                    onComplete: () => spark.destroy(),
                  });
                }
                particle.destroy();
              },
            });
          });
        }
      },
      loop: true,
    });
  }

  createInteractivePanel() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Panel centrado en la parte inferior
    const panelX = width / 2 - 180;
    const panelY = height - 160;
    const panelWidth = 360;
    const panelHeight = 140;

    // Fondo del panel
    const panelBg = this.add.graphics();
    panelBg.fillGradientStyle(0x1a2332, 0x1a2332, 0x0f1419, 0x0f1419, 1);
    panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
    panelBg.lineStyle(3, 0x00ddff, 0.9);
    panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);

    // Título del panel
    this.add.text(panelX + 20, panelY + 15, "🎛️ CONFIGURACIÓN", {
      fontSize: "18px",
      fill: "#00ddff",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
    });

    // Indicador de satélite seleccionado
    this.selectedSatelliteText = this.add.text(
      panelX + 20,
      panelY + 45,
      "Selecciona un satélite para configurar",
      {
        fontSize: "14px",
        fill: "#ffaa00",
        fontFamily: "Arial, sans-serif",
      }
    );

    // Controles de frecuencia
    this.add.text(panelX + 20, panelY + 65, "Frecuencia:", {
      fontSize: "14px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
    });

    this.frequencyText = this.add.text(
      panelX + 120,
      panelY + 65,
      this.frequency.toString() + " MHz",
      {
        fontSize: "14px",
        fill: "#00ff88",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
      }
    );

    // Botones de frecuencia
    this.createButton(panelX + 220, panelY + 60, "-25", () =>
      this.adjustFrequency(-25)
    );
    this.createButton(panelX + 260, panelY + 60, "+25", () =>
      this.adjustFrequency(25)
    );

    // Controles de potencia
    this.add.text(panelX + 20, panelY + 95, "Potencia:", {
      fontSize: "14px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
    });

    this.powerText = this.add.text(
      panelX + 120,
      panelY + 95,
      this.signalPower.toString() + " W",
      {
        fontSize: "14px",
        fill: "#00ff88",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
      }
    );

    // Botones de potencia
    this.createButton(panelX + 220, panelY + 90, "-5", () =>
      this.adjustPower(-5)
    );
    this.createButton(panelX + 260, panelY + 90, "+5", () =>
      this.adjustPower(5)
    );

    // Botón de aplicar - al lado derecho del panel
    this.createApplyButton(
      panelX + panelWidth + 20,
      panelY + panelHeight / 2 - 15
    );

    // Estado del juego debajo del panel de estado
    this.gameStatusText = this.add.text(
      160,
      300,
      ` Objetivo: ${this.optimalFrequency} MHz, ${this.optimalPower} W`,
      {
        fontSize: "14px",
        fill: "#00ff88",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        backgroundColor: "#001122",
        padding: { x: 10, y: 5 },
      }
    ).setOrigin(0.5);
  }

  createButton(x, y, text, callback) {
    const button = this.add
      .text(x, y, text, {
        fontSize: "14px",
        fill: "#ffffff",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0066aa",
        padding: { x: 8, y: 4 },
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", callback);
    button.on("pointerover", () => {
      button.setStyle({ backgroundColor: "#0088cc" });
      this.tweens.add({
        targets: button,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
      });
    });
    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: "#0066aa" });
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });
  }

  createApplyButton(x, y) {
    const button = this.add
      .text(x, y, "APLICAR", {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#00aa00",
        padding: { x: 12, y: 8 },
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => this.applyConfiguration());
    button.on("pointerover", () => {
      button.setStyle({ backgroundColor: "#00cc00" });
      this.tweens.add({
        targets: button,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
      });
    });
    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: "#00aa00" });
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });
  }

  updateGameStatus() {
    if (this.gameStatusText) {
      let objectiveText = "";
      if (
        this.currentSatellite >= 0 &&
        this.satelliteObjectives[this.currentSatellite]
      ) {
        // Mostrar objetivos aleatorios para el satélite seleccionado
        const objective = this.satelliteObjectives[this.currentSatellite];
        const satelliteName = this.currentSatellite === 0 ? "ALFA" : "BETA";
        objectiveText = `SATÉLITE ${satelliteName} - Objetivo: ${objective.frequency} MHz, ${objective.power} W`;
      } else {
        objectiveText = `Selecciona un satélite para ver sus objetivos aleatorios`;
      }

      this.gameStatusText.setText(
        `${objectiveText}`
      );

      // Mostrar mensaje de felicitaciones si ambos están configurados
      if (
        this.satellitesConfigured === this.totalSatellites &&
        !this.congratulationsShown
      ) {
        this.showCongratulations();
        this.congratulationsShown = true;
      }
    }
  }

  createFrequencyControl(x, y) {
    this.add.text(x, y, "Frecuencia (MHz):", {
      fontSize: "14px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
    });

    this.frequencyText = this.add.text(x + 150, y, this.frequency.toString(), {
      fontSize: "14px",
      fill: "#00ff88",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
    });

    // Botones de ajuste
    this.createAdjustButton(x + 200, y, "-", () => this.adjustFrequency(-25));
    this.createAdjustButton(x + 230, y, "+", () => this.adjustFrequency(25));
  }

  createPowerControl(x, y) {
    this.add.text(x, y, "Potencia (W):", {
      fontSize: "14px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
    });

    this.powerText = this.add.text(x + 150, y, this.signalPower.toString(), {
      fontSize: "14px",
      fill: "#00ff88",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
    });

    // Botones de ajuste
    this.createAdjustButton(x + 200, y, "-", () => this.adjustPower(-5));
    this.createAdjustButton(x + 230, y, "+", () => this.adjustPower(5));
  }

  createAdjustButton(x, y, text, callback) {
    const button = this.add
      .text(x, y, text, {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0066aa",
        padding: { x: 8, y: 4 },
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", callback);
    button.on("pointerover", () =>
      button.setStyle({ backgroundColor: "#0088cc" })
    );
    button.on("pointerout", () =>
      button.setStyle({ backgroundColor: "#0066aa" })
    );
  }

  createApplyButton(x, y) {
    const button = this.add
      .text(x, y, "🔧 APLICAR CONFIGURACIÓN", {
        fontSize: "14px",
        fill: "#ffffff",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#00aa00",
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => this.applyConfiguration());
    button.on("pointerover", () =>
      button.setStyle({ backgroundColor: "#00cc00" })
    );
    button.on("pointerout", () =>
      button.setStyle({ backgroundColor: "#00aa00" })
    );
  }

  createStatusPanel() {
    const panelX = 20;
    const panelY = 120;
    const panelWidth = 220;
    const panelHeight = 160;

    // Fondo del panel unificado
    const panelBg = this.add.graphics();
    panelBg.fillGradientStyle(0x1a2332, 0x1a2332, 0x0f1419, 0x0f1419, 1);
    panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
    panelBg.lineStyle(2, 0x00ddff, 0.8);
    panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);

    // Título del panel
    this.add.text(panelX + 15, panelY + 10, "📊 ESTADO DE LA RED", {
      fontSize: "14px",
      fill: "#00ddff",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
    });

    // Información compacta en una sola línea
    this.add.text(panelX + 15, panelY + 35, "Red:", {
      fontSize: "12px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
    });

    this.networkQualityText = this.add.text(panelX + 45, panelY + 35, "0%", {
      fontSize: "12px",
      fill: "#ff6666",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
    });

    this.add.text(panelX + 80, panelY + 35, "Satélites:", {
      fontSize: "12px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
    });

    this.satellitesText = this.add.text(panelX + 140, panelY + 35, "0/2", {
      fontSize: "12px",
      fill: "#ff6666",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
    });

    this.add.text(panelX + 15, panelY + 55, "Interferencia:", {
      fontSize: "12px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
    });

    this.interferenceText = this.add.text(panelX + 95, panelY + 55, "0%", {
      fontSize: "12px",
      fill: "#00ff88",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
    });

    // Barra de progreso compacta
    this.createProgressBar(panelX + 15, panelY + 85);

    // Estado de la misión
    this.missionStatusText = this.add.text(
      panelX + 15,
      panelY + 125,
      "Configurando red...",
      {
        fontSize: "12px",
        fill: "#ffaa00",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
      }
    );
  }

  createProgressBar(x, y) {
    const barWidth = 190;
    const barHeight = 15;

    // Etiqueta compacta
    this.add.text(x, y - 15, "Progreso:", {
      fontSize: "11px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
    });

    // Fondo de la barra
    this.progressBarBg = this.add
      .rectangle(x, y, barWidth, barHeight, 0x333333, 0.8)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x666666);

    // Barra de progreso
    this.progressBar = this.add
      .rectangle(x, y, 0, barHeight, 0x00ff00, 0.8)
      .setOrigin(0, 0);
  }

  createTimer() {
    this.timerText = this.add
      .text(this.sys.game.config.width - 20, 20, "", {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
      })
      .setOrigin(1, 0);
  }

  startTimer() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  updateTimer() {
    this.timeRemaining -= 1000;

    const minutes = Math.floor(this.timeRemaining / 60000);
    const seconds = Math.floor((this.timeRemaining % 60000) / 1000);

    this.timerText.setText(
      `⏱️ ${minutes}:${seconds.toString().padStart(2, "0")}`
    );

    if (this.timeRemaining <= 30000) {
      this.timerText.setStyle({ fill: "#ff0000" });
    } else if (this.timeRemaining <= 60000) {
      this.timerText.setStyle({ fill: "#ffaa00" });
    }

    if (this.timeRemaining <= 0 && !this.gameCompleted) {
      this.gameOver();
    }
  }

  gameOver() {
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    const gameOverMessage = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "⏰ ¡TIEMPO AGOTADO!\n\nNo lograste configurar ambos satélites\na tiempo",
        {
          fontSize: "24px",
          fill: "#ff0000",
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          align: "center",
          backgroundColor: "#000000",
          padding: { x: 20, y: 15 },
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    // Botón para reintentar
    this.time.delayedCall(3000, () => {
      const retryButton = this.add
        .text(
          this.sys.game.config.width / 2,
          this.sys.game.config.height / 2 + 100,
          "🔄 REINTENTAR",
          {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#aa0000",
            padding: { x: 15, y: 8 },
          }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(1000);

      retryButton.on("pointerdown", () => {
        this.scene.restart();
      });
    });
  }

  adjustFrequency(amount) {
    if (this.isAdjusting) return;

    this.frequency = Math.max(2000, Math.min(3000, this.frequency + amount));
    this.frequencyText.setText(this.frequency.toString() + " MHz");
    this.updateInterference();
  }

  adjustPower(amount) {
    if (this.isAdjusting) return;

    this.signalPower = Math.max(10, Math.min(100, this.signalPower + amount));
    this.powerText.setText(this.signalPower.toString() + " W");
    this.updateInterference();
  }

  updateInterference() {
    // Calcular interferencia basada en la diferencia con valores óptimos
    const freqDiff = Math.abs(this.frequency - this.optimalFrequency);
    const powerDiff = Math.abs(this.signalPower - this.optimalPower);

    this.interference = Math.min(100, freqDiff / 10 + powerDiff / 2);

    this.interferenceText.setText(Math.round(this.interference) + "%");

    // Cambiar color según interferencia
    if (this.interference > 50) {
      this.interferenceText.setStyle({ fill: "#ff6666" });
    } else if (this.interference > 25) {
      this.interferenceText.setStyle({ fill: "#ffaa00" });
    } else {
      this.interferenceText.setStyle({ fill: "#00ff88" });
    }
  }

  applyConfiguration() {
    if (!this.selectedSatellite) {
      this.showFeedback("⚠️ Selecciona un satélite primero", "#ff6666");
      return;
    }

    if (this.selectedSatellite.configured) {
      this.showFeedback("⚠️ Este satélite ya está configurado", "#ffaa00");
      return;
    }

    // Verificar si los parámetros coinciden exactamente con los objetivos
    const freqInRange = this.frequency === this.optimalFrequency;
    const powerInRange = this.signalPower === this.optimalPower;

    if (freqInRange && powerInRange) {
      // Configuración exitosa
      this.configureSatellite(this.selectedSatellite.index);
      this.showFeedback("✅ Configuración aplicada correctamente", "#00ff00");

      // Actualizar estado del juego
      this.updateGameStatus();
      this.updateConnectionLine();
    } else {
      // Configuración fallida con detalles específicos
      let errorMsg = "❌ Configuración incorrecta:\n";
      if (!freqInRange) {
        errorMsg += `• Frecuencia: ${this.frequency} MHz (objetivo: ${this.optimalFrequency} MHz)\n`;
      }
      if (!powerInRange) {
        errorMsg += `• Potencia: ${this.signalPower} W (objetivo: ${this.optimalPower} W)`;
      }

      this.showFeedback(errorMsg, "#ff6666");
    }
  }

  selectSatellite(index) {
    this.selectedSatellite = this.satellites[index];
    this.currentSatellite = index;

    // Actualizar valores objetivo según el satélite seleccionado (aleatorios)
    if (this.satelliteObjectives[index]) {
      this.optimalFrequency = this.satelliteObjectives[index].frequency;
      this.optimalPower = this.satelliteObjectives[index].power;
    }

    // Actualizar valores en el panel
    this.frequency = this.selectedSatellite.frequency || 2400;
    this.signalPower = this.selectedSatellite.power || 50;

    // Actualizar textos del panel
    if (this.frequencyText) {
      this.frequencyText.setText(this.frequency.toString() + " MHz");
    }
    if (this.powerText) {
      this.powerText.setText(this.signalPower.toString() + " W");
    }

    // Actualizar el texto del satélite seleccionado
    if (this.selectedSatelliteText) {
      const satelliteName = index === 0 ? "ALFA" : "BETA";
      this.selectedSatelliteText.setText(
        `🛰️ Configurando: SATÉLITE ${satelliteName}`
      );
      this.selectedSatelliteText.setFill("#00ff88");
    }

    // Actualizar el estado del juego para mostrar el objetivo del satélite seleccionado
    this.updateGameStatus();

    // Resaltar el satélite seleccionado
    this.satellites.forEach((sat, i) => {
      const statusLight = sat.statusLight;
      const statusText = sat.statusText;
      const background = sat.background;

      if (i === index) {
        statusLight.setFillStyle(0xffaa00); // Amarillo para seleccionado
        statusText.setText("SELECCIONADO");
        statusText.setFill("#ffaa00");
        background.setStrokeStyle(4, 0xffaa00, 1.0);
      } else if (sat.configured) {
        statusLight.setFillStyle(0x00ff00); // Verde para configurado
        statusText.setText("CONFIGURADO");
        statusText.setFill("#00ff88");
        background.setStrokeStyle(3, 0x00ff88, 0.8);
      } else {
        statusLight.setFillStyle(0xff0000); // Rojo para no configurado
        statusText.setText("SIN CONFIGURAR");
        statusText.setFill("#ff6666");
        background.setStrokeStyle(2, 0x00ddff, 0.5);
      }
    });

    // Actualizar el estado del juego para mostrar objetivos específicos
    this.updateGameStatus();
  }

  configureSatellite(index) {
    if (index >= this.satellites.length || this.satellites[index].configured)
      return;

    const satellite = this.satellites[index];
    satellite.configured = true;
    satellite.frequency = this.frequency;
    satellite.power = this.signalPower;

    // Cambiar indicador de estado a verde
    satellite.statusLight.setFillStyle(0x00ff00);
    satellite.statusText.setText("CONFIGURADO");
    satellite.statusText.setFill("#00ff88");
    satellite.background.setStrokeStyle(6, 0x00ff88, 1.0);

    // Efecto de configuración exitosa
    this.createSuccessEffect(satellite);

    // Efecto de éxito
    this.tweens.add({
      targets: satellite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      ease: "Power2",
    });

    this.satellitesConfigured++;
    this.updateNetworkQuality();
    this.updateConnectionLine();

    // Actualizar estado del juego para mostrar progreso y felicitaciones
    this.updateGameStatus();

    // Verificar si ambos satélites están configurados
    if (this.satellitesConfigured >= this.totalSatellites) {
      this.completeMission();
    }
  }

  updateNetworkQuality() {
    this.networkQuality =
      (this.satellitesConfigured / this.totalSatellites) * 100;

    // Reducir calidad por interferencia
    this.networkQuality = Math.max(0, this.networkQuality - this.interference);

    this.networkQualityText.setText(Math.round(this.networkQuality) + "%");
    this.satellitesText.setText(
      `${this.satellitesConfigured}/${this.totalSatellites}`
    );

    // Actualizar barra de progreso
    const barWidth = 190;
    const progress = this.networkQuality / 100;

    this.tweens.add({
      targets: this.progressBar,
      width: barWidth * progress,
      duration: 500,
      ease: "Power2",
    });

    // Cambiar colores según calidad
    if (this.networkQuality >= 80) {
      this.networkQualityText.setStyle({ fill: "#00ff88" });
      this.satellitesText.setStyle({ fill: "#00ff88" });
      this.progressBar.setFillStyle(0x00ff00);
    } else if (this.networkQuality >= 50) {
      this.networkQualityText.setStyle({ fill: "#ffaa00" });
      this.satellitesText.setStyle({ fill: "#ffaa00" });
      this.progressBar.setFillStyle(0xffaa00);
    } else {
      this.networkQualityText.setStyle({ fill: "#ff6666" });
      this.satellitesText.setStyle({ fill: "#ff6666" });
      this.progressBar.setFillStyle(0xff6666);
    }
  }

  createSuccessEffect(target) {
    // Partículas de éxito
    for (let i = 0; i < 12; i++) {
      const particle = this.add.circle(
        target.x,
        target.y,
        Phaser.Math.Between(3, 6),
        0x00ff00,
        0.8
      );

      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-60, 60),
        y: particle.y + Phaser.Math.Between(-60, 60),
        alpha: 0,
        scale: 0,
        duration: 1000,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });
    }
  }

  showFeedback(message, color) {
    // Crear mensaje de feedback
    const feedbackBg = this.add
      .rectangle(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        600,
        80,
        0x000000,
        0.9
      )
      .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(color).color);

    const feedbackText = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        message,
        {
          fontSize: "18px",
          fill: color,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Animación de aparición
    feedbackBg.setScale(0);
    feedbackText.setScale(0);

    this.tweens.add({
      targets: [feedbackBg, feedbackText],
      scale: 1,
      duration: 300,
      ease: "Back.easeOut",
    });

    // Eliminar después de 2 segundos
    this.time.delayedCall(2000, () => {
      feedbackBg.destroy();
      feedbackText.destroy();
    });
  }

  completeMission() {
    this.gameCompleted = true;

    // Detener el temporizador
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    // Llamar a showCongratulations para mostrar el mensaje de felicitaciones
    if (!this.congratulationsShown) {
      this.showCongratulations();
      this.congratulationsShown = true;
    }

    // Efectos de partículas
    this.createCelebrationEffects();
  }

  createCelebrationEffects() {
    // Efectos de celebración cuando se completa la misión
    for (let i = 0; i < 30; i++) {
      const colors = [0x00ff00, 0x0088ff, 0xffaa00, 0xff0088];
      const particle = this.add.circle(
        Phaser.Math.Between(0, this.sys.game.config.width),
        this.sys.game.config.height + 10,
        Phaser.Math.Between(4, 10),
        colors[Phaser.Math.Between(0, colors.length - 1)]
      );

      this.tweens.add({
        targets: particle,
        y: -10,
        x: particle.x + Phaser.Math.Between(-200, 200),
        duration: Phaser.Math.Between(2000, 4000),
        ease: "Power2",
        onComplete: () => {
          particle.destroy();
        },
      });
    }

    // Efecto de pulso en toda la pantalla
    const overlay = this.add.graphics();
    overlay.fillStyle(0x00ff00, 0.15);
    overlay.fillRect(
      0,
      0,
      this.sys.game.config.width,
      this.sys.game.config.height
    );
    overlay.setDepth(999);

    this.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => {
        overlay.destroy();
      },
    });
  }

  showCongratulations() {
    // Crear mensaje de felicitaciones
    const congratsText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 100,
        "¡FELICITACIONES!\n\nAmbos satélites están configurados\ny listos para comunicarse",
        {
          fontSize: "32px",
          fill: "#00ff00",
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          align: "center",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    // Efecto de aparición
    congratsText.setAlpha(0);
    congratsText.setScale(0.5);

    this.tweens.add({
      targets: congratsText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      ease: "Back.easeOut",
    });

    // Efecto de pulso
    this.tweens.add({
      targets: congratsText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Crear partículas de celebración
    this.createCelebrationParticles();

    // Ocultar mensaje después de 3 segundos y pasar a la siguiente escena
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: congratsText,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 500,
        onComplete: () => {
          congratsText.destroy();
          // Pasar a la siguiente escena
          this.scene.start("scenaVideo4");
        },
      });
    });
  }

  createCelebrationParticles() {
    // Crear partículas doradas de celebración
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 100, () => {
        const x = this.cameras.main.centerX + (Math.random() - 0.5) * 400;
        const y = this.cameras.main.centerY + (Math.random() - 0.5) * 300;

        const particle = this.add.circle(x, y, 6, 0xffd700, 1.0);
        particle.setDepth(99);
        particle.setStrokeStyle(2, 0xffff00, 0.8);

        this.tweens.add({
          targets: particle,
          y: y - 200,
          alpha: 0,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: 2000,
          ease: "Power2",
          onComplete: () => particle.destroy(),
        });
      });
    }
  }
}
