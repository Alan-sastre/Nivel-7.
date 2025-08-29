class scenaFallos extends Phaser.Scene {
  constructor() {
    super({ key: "scenaFallos" });
    this.answered = false;
    this.correctOption = 0; // (A) es la correcta
    this.scanProgress = 0;
    this.isScanning = false;
    this.anomaliesFound = 0;
    this.totalAnomalies = 3;
    this.gameCompleted = false;
    this.showingDamageMessage = false; // Control para evitar superposición de mensajes
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    this.options = [
      "Las ondas de radio se debilitan con la distancia.",
      "La luz del sol bloquea las señales.",
      "No existen interferencias en el vacío.",
      "Los satélites no necesitan transmitir señales constantemente."
    ];

    this.feedbackTexts = [
      "¡Correcto! En el espacio, las señales de radio pierden potencia a medida que viajan largas distancias, por lo que deben amplificarse.",
      "Intenta de nuevo. Piensa en cómo las ondas de radio viajan en el espacio.",
      "Intenta de nuevo. Piensa en cómo las ondas de radio viajan en el espacio.",
      "Intenta de nuevo. Piensa en cómo las ondas de radio viajan en el espacio."
    ];
  }

  preload() {
    // Usar imagen de fondo existente
    this.load.image("satellite_bg", "assets/scenaPrincipal/1.jpg");
    this.load.image("particle", "assets/logorobcodesolutions.ico");
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo espacial con efecto de estrellas
    this.createSpaceBackground();

    // Título principal con animación
    this.createTitle();

    // Crear el satélite interactivo
    this.createSatellite();

    // Crear el escáner digital
    this.createScanner();

    // Crear panel de información
    this.createInfoPanel();

    // Crear controles móviles si es necesario
    if (this.isMobile) {
      this.createMobileControls();
    }

    // Configurar eventos de entrada
    this.setupInputEvents();

    // Iniciar animaciones de fondo
    this.startBackgroundAnimations();
  }

  createSpaceBackground() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo degradado espacial
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000011, 0x000011, 0x001122, 0x001122, 1);
    bg.fillRect(0, 0, width, height);

    // Crear estrellas animadas
    this.stars = [];
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      this.stars.push(star);

      // Animación de parpadeo
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: 0.1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  createTitle() {
    const centerX = this.cameras.main.centerX;

    // Título principal
    this.titleText = this.add.text(centerX, 60, "🛰️ DIAGNÓSTICO DEL SATÉLITE", {
      fontSize: this.isMobile ? "24px" : "32px",
      fill: "#00ffff",
      fontFamily: "Arial Black",
      align: "center",
      stroke: "#003366",
      strokeThickness: 3,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#00ffff',
        blur: 15,
        fill: true
      }
    }).setOrigin(0.5);

    // Subtítulo
    this.subtitleText = this.add.text(centerX, 100, "Usa el escáner para detectar anomalías", {
      fontSize: this.isMobile ? "14px" : "16px",
      fill: "#88ccff",
      fontFamily: "Arial",
      align: "center"
    }).setOrigin(0.5);

    // Título sin animación para mejor legibilidad
  }

  createSatellite() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Contenedor del satélite
    this.satelliteContainer = this.add.container(centerX, centerY - 30);

    // Cuerpo principal del satélite (más detallado y realista)
    this.satelliteBody = this.add.rectangle(0, 0, 110, 65, 0x555555)
      .setStrokeStyle(3, 0xaaaaaa);

    // Detalles del cuerpo principal
    this.bodyDetail1 = this.add.rectangle(0, -8, 80, 12, 0x333333)
      .setStrokeStyle(1, 0x666666);
    this.bodyDetail2 = this.add.rectangle(0, 8, 70, 10, 0x444444)
      .setStrokeStyle(1, 0x777777);

    // Módulo de comunicación principal
    this.commModule = this.add.rectangle(0, -20, 50, 25, 0x222222)
      .setStrokeStyle(2, 0x888888);

    // Luces indicadoras
    this.light1 = this.add.circle(-15, -20, 4, 0x00ff00);
    this.light2 = this.add.circle(15, -20, 4, 0xff0000);

    // Paneles solares más realistas y grandes
    this.solarPanel1 = this.add.rectangle(-85, 0, 35, 90, 0x001144)
      .setStrokeStyle(3, 0x0077dd);
    this.solarPanel2 = this.add.rectangle(85, 0, 35, 90, 0x001144)
      .setStrokeStyle(3, 0x0077dd);

    // Líneas en los paneles solares para simular celdas fotovoltaicas
    const panel1Lines = this.add.graphics();
    panel1Lines.lineStyle(2, 0x0099ff, 0.8);
    for (let i = -4; i <= 4; i++) {
      panel1Lines.moveTo(-85, i * 10);
      panel1Lines.lineTo(-67, i * 10);
    }
    // Líneas verticales
    for (let j = -100; j <= -70; j += 10) {
      panel1Lines.moveTo(j, -40);
      panel1Lines.lineTo(j, 40);
    }
    panel1Lines.stroke();

    const panel2Lines = this.add.graphics();
    panel2Lines.lineStyle(2, 0x0099ff, 0.8);
    for (let i = -4; i <= 4; i++) {
      panel2Lines.moveTo(67, i * 10);
      panel2Lines.lineTo(85, i * 10);
    }
    // Líneas verticales
    for (let j = 70; j <= 100; j += 10) {
      panel2Lines.moveTo(j, -40);
      panel2Lines.lineTo(j, 40);
    }
    panel2Lines.stroke();

    // Antena parabólica más detallada
    this.antenna = this.add.circle(0, -50, 18, 0xdddddd, 0)
      .setStrokeStyle(4, 0xffffff);

    // Receptor central de la antena
    this.antennaReceiver = this.add.circle(0, -50, 6, 0xffaa00);

    // Soporte de la antena más robusto
    this.antennaSupport = this.add.rectangle(0, -38, 8, 20, 0xbbbbbb)
      .setStrokeStyle(2, 0xdddddd);

    // Puntos de anomalía (OCULTOS INICIALMENTE)
    this.anomalyPoints = [
      this.add.circle(-35, -15, 18, 0xff0000, 0).setInteractive().setStrokeStyle(4, 0xff4444).setVisible(false),
      this.add.circle(35, 20, 18, 0xff0000, 0).setInteractive().setStrokeStyle(4, 0xff4444).setVisible(false),
      this.add.circle(0, 35, 18, 0xff0000, 0).setInteractive().setStrokeStyle(4, 0xff4444).setVisible(false)
    ];

    // Agregar elementos al contenedor
    this.satelliteContainer.add([
      this.solarPanel1, this.solarPanel2, panel1Lines, panel2Lines,
      this.satelliteBody, this.bodyDetail1, this.bodyDetail2,
      this.commModule, this.light1, this.light2,
      this.antennaSupport, this.antenna, this.antennaReceiver,
      ...this.anomalyPoints
    ]);

    // Animación de rotación más lenta y suave
    this.tweens.add({
      targets: this.satelliteContainer,
      rotation: Math.PI * 2,
      duration: 15000,
      repeat: -1,
      ease: 'Linear'
    });

    // Animación de las luces indicadoras
    this.tweens.add({
      targets: this.light1,
      alpha: { from: 1, to: 0.3 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: this.light2,
      alpha: { from: 0.3, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createScanner() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Círculo del escáner (más pequeño)
    this.scannerCircle = this.add.circle(centerX, centerY + 150, 35, 0x00ffff, 0)
      .setStrokeStyle(3, 0x00ffff, 0.8)
      .setInteractive({ useHandCursor: true });

    // Texto del escáner
    this.scannerText = this.add.text(centerX, centerY + 150, "🔍 ESCÁNER", {
      fontSize: this.isMobile ? "16px" : "18px",
      fill: "#00ffff",
      fontFamily: "Arial Bold",
      align: "center"
    }).setOrigin(0.5);

    // Barra de progreso del escaneo (más abajo)
    this.progressBar = this.add.rectangle(centerX, centerY + 210, 200, 10, 0x333333)
      .setStrokeStyle(2, 0x666666);
    this.progressFill = this.add.rectangle(centerX - 100, centerY + 210, 0, 6, 0x00ff00)
      .setOrigin(0, 0.5);

    // Eventos del escáner
    this.scannerCircle.on('pointerdown', () => this.startScan());
    this.scannerText.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startScan());
  }

  createInfoPanel() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Panel de información (reposicionado para que no se salga)
    const panelWidth = this.isMobile ? 250 : 280;
    const panelX = this.isMobile ? width - 10 : width - 20;

    this.infoPanel = this.add.rectangle(panelX, 140, panelWidth, 180, 0x000033, 0.9)
      .setStrokeStyle(2, 0x0066cc)
      .setOrigin(1, 0);

    // Texto de información
    this.infoText = this.add.text(panelX - panelWidth + 10, 150,
      "ESTADO DEL SISTEMA:\n" +
      "🔴 Comunicación: INACTIVA\n" +
      "⚡ Energía: 78%\n" +
      "📡 Señal: DÉBIL\n" +
      "\nAnomalías: 0/3", {
      fontSize: this.isMobile ? "11px" : "13px",
      fill: "#ffffff",
      fontFamily: "Courier New",
      lineSpacing: 4
    }).setOrigin(0, 0);
  }

  createMobileControls() {
    // Instrucciones para móviles
    this.add.text(this.cameras.main.centerX, this.cameras.main.height - 40,
      "Toca el escáner para buscar anomalías", {
      fontSize: "14px",
      fill: "#ffff00",
      fontFamily: "Arial",
      align: "center"
    }).setOrigin(0.5);
  }

  setupInputEvents() {
    // Eventos para detectar anomalías
    this.anomalyPoints.forEach((point, index) => {
      point.on('pointerdown', () => {
        // Permitir clic solo si no hay mensaje mostrándose y la anomalía es válida
        if (!this.isScanning && !this.showingDamageMessage && point.visible && point.alpha > 0 && !point.getData('found')) {
          this.detectAnomaly(point, index);
        }
      });
    });
  }

  startBackgroundAnimations() {
    // Animación de los paneles solares
    this.tweens.add({
      targets: [this.solarPanel1, this.solarPanel2],
      alpha: { from: 1, to: 0.7 },
      duration: 3000,
      yoyo: true,
      repeat: -1
    });

    // Parpadeo de la antena
    this.tweens.add({
      targets: this.antenna,
      tint: { from: 0xcccccc, to: 0xff0000 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }

  startScan() {
    if (this.isScanning || this.gameCompleted) return;

    this.isScanning = true;
    this.scanProgress = 0;

    // Crear rayo láser de escaneo
    this.createScanLaser();

    // Escáner sin animación para mejor estabilidad

    // Progreso del escaneo
    this.tweens.add({
      targets: this.progressFill,
      width: 200,
      duration: 3000,
      ease: 'Power2',
      onUpdate: () => {
        this.scanProgress = this.progressFill.width / 200;
      },
      onComplete: () => {
        this.completeScan();
      }
    });

    // Sonido de escaneo (simulado con vibración en móviles)
    if (this.isMobile && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  createScanLaser() {
    // Función vacía - animación del satélite removida
  }

  completeScan() {
    this.isScanning = false;

    // Efectos de animación removidos

    // Mostrar anomalías con mejor visibilidad
    this.anomalyPoints.forEach((point, index) => {
      // Hacer visible la anomalía
      point.setVisible(true);
      point.setAlpha(0.9);
      point.setFillStyle(0xff0000); // Rojo brillante

      // Animación de aparición dramática
      this.tweens.add({
        targets: point,
        scale: { from: 0.2, to: 1.5 },
        alpha: { from: 0, to: 0.9 },
        duration: 500,
        delay: index * 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Animación de pulso continuo más visible
          this.tweens.add({
            targets: point,
            scale: { from: 1, to: 1.4 },
            alpha: { from: 0.9, to: 0.6 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      });
    });

    // Mostrar instrucciones para hacer clic en las anomalías
     this.instructionText = this.add.text(
       this.cameras.main.centerX,
       this.cameras.main.centerY + 80,
       "🔴 ¡Anomalías detectadas!\n👆 Haz clic en los puntos rojos", {
       fontSize: this.isMobile ? "13px" : "15px",
       fill: "#ffff00",
       fontFamily: "Arial Bold",
       align: "center",
       stroke: "#000000",
       strokeThickness: 2,
       wordWrap: { width: this.isMobile ? 300 : 400 },
       shadow: {
         offsetX: 0,
         offsetY: 0,
         color: '#ffff00',
         blur: 8,
         fill: true
       }
     }).setOrigin(0.5).setAlpha(0);

    // Animar aparición de instrucciones
    this.tweens.add({
      targets: this.instructionText,
      alpha: 1,
      scale: { from: 0.8, to: 1 },
      duration: 800,
      delay: 1000,
      ease: 'Back.easeOut'
    });

    // Resetear barra de progreso
    this.tweens.add({
      targets: this.progressFill,
      width: 0,
      duration: 500,
      delay: 1000
    });
  }

  detectAnomaly(point, index) {
    // Marcar anomalía como encontrada
    point.setData('found', true);
    point.setFillStyle(0x00ff00, 0.8);
    point.removeInteractive();
    this.anomaliesFound++;

    // Detener animaciones de pulso
    this.tweens.killTweensOf(point);

    // Mensajes específicos de daño según la anomalía
    const damageMessages = [
      "⚠️ FALLO DETECTADO:\nSobrecalentamiento en panel solar izquierdo\nTemperatura: 85°C (Crítico)",
      "⚠️ FALLO DETECTADO:\nCortocircuito en módulo de comunicación\nSeñal degradada al 23%",
      "⚠️ FALLO DETECTADO:\nDesalineación de antena parabólica\nPérdida de orientación: 15.7°"
    ];

    // Mostrar mensaje de daño específico
    this.showDamageMessage(damageMessages[index]);

    // Efecto visual de éxito
    this.tweens.add({
      targets: point,
      scale: { from: 1, to: 1.5 },
      duration: 300,
      yoyo: true,
      repeat: 1,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Efecto de desvanecimiento
        this.tweens.add({
          targets: point,
          scale: { from: 1, to: 2 },
          alpha: { from: 0.8, to: 0 },
          duration: 800,
          ease: 'Power2'
        });
      }
    });

    // Actualizar información
    this.updateInfoPanel();

    // Vibración en móviles
    if (this.isMobile && navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Verificar si se completó el diagnóstico
    if (this.anomaliesFound >= this.totalAnomalies) {
      this.completePhase1();
    }
  }

  showDamageMessage(message) {
    // Bloquear interacciones mientras se muestra el mensaje
    this.showingDamageMessage = true;

    // Crear panel de mensaje de daño
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const messagePanel = this.add.rectangle(centerX, centerY - 100,
      this.isMobile ? 300 : 400,
      this.isMobile ? 80 : 100,
      0x330000, 0.95)
      .setStrokeStyle(3, 0xff0000);

    const messageText = this.add.text(centerX, centerY - 100, message, {
      fontSize: this.isMobile ? "11px" : "13px",
      fill: "#ff6666",
      fontFamily: "Courier New",
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: this.isMobile ? 280 : 380 }
    }).setOrigin(0.5);

    // Animación de aparición
    messagePanel.setScale(0);
    messageText.setScale(0);

    this.tweens.add({
      targets: [messagePanel, messageText],
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Desaparecer después de 5 segundos
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: [messagePanel, messageText],
        alpha: 0,
        scale: 0.8,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          messagePanel.destroy();
          messageText.destroy();
          // Desbloquear interacciones cuando el mensaje desaparece
          this.showingDamageMessage = false;
        }
      });
    });
  }

  updateInfoPanel() {
    const status = this.anomaliesFound >= this.totalAnomalies ? "REPARANDO" : "INACTIVA";
    const signal = this.anomaliesFound >= 2 ? "MEJORANDO" : "DÉBIL";

    this.infoText.setText(
      "ESTADO DEL SISTEMA:\n" +
      `🔴 Comunicación: ${status}\n` +
      "⚡ Energía: 78%\n" +
      `📡 Señal: ${signal}\n` +
      `\nAnomalías: ${this.anomaliesFound}/${this.totalAnomalies}`
    );
  }

  completePhase1() {
    this.gameCompleted = true;

    // Efecto de reparación completada
    this.tweens.add({
      targets: this.satelliteContainer,
      tint: { from: 0xffffff, to: 0x00ff00 },
      duration: 1000,
      yoyo: true,
      repeat: 2
    });

    // Mostrar mensaje de éxito
    const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100,
      "¡DIAGNÓSTICO COMPLETADO!\n🎉 Satélite reparado", {
      fontSize: this.isMobile ? "18px" : "22px",
      fill: "#00ff00",
      fontFamily: "Arial Bold",
      align: "center",
      stroke: "#003300",
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: successText,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 1000,
      ease: 'Back.easeOut'
    });

    // Continuar a la pregunta después de 3 segundos
    this.time.delayedCall(3000, () => {
      this.showQuestion();
    });
  }

  showQuestion() {
    // Limpiar elementos del diagnóstico
    this.satelliteContainer.setVisible(false);
    this.scannerCircle.setVisible(false);
    this.scannerText.setVisible(false);
    this.progressBar.setVisible(false);
    this.progressFill.setVisible(false);
    this.infoPanel.setVisible(false);
    this.infoText.setVisible(false);
    if (this.instructionText) {
      this.instructionText.setVisible(false);
    }

    // Actualizar título
    this.titleText.setText("📡 PREGUNTA DE COMUNICACIÓN");
    this.subtitleText.setText("Responde basándote en tu diagnóstico");

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Panel de pregunta
    const questionPanel = this.add.rectangle(centerX, centerY,
      this.isMobile ? 350 : 600,
      this.isMobile ? 400 : 450,
      0x001133, 0.9)
      .setStrokeStyle(3, 0x0066cc);

    // Pregunta
    this.add.text(centerX, centerY - 120,
      "¿Cuál es el principal desafío en la\ntransmisión de señales en el espacio?", {
      fontSize: this.isMobile ? "16px" : "20px",
      fill: "#ffffff",
      fontFamily: "Arial Bold",
      align: "center",
      lineSpacing: 8
    }).setOrigin(0.5);

    // Opciones de respuesta
    this.optionButtons = [];
    for (let i = 0; i < this.options.length; i++) {
      const y = centerY - 40 + i * (this.isMobile ? 45 : 50);

      const button = this.add.rectangle(centerX, y,
        this.isMobile ? 320 : 550,
        this.isMobile ? 35 : 40,
        0x003366, 0.8)
        .setStrokeStyle(2, 0x0066cc)
        .setInteractive({ useHandCursor: true });

      const text = this.add.text(centerX, y,
        `${String.fromCharCode(65 + i)}) ${this.options[i]}`, {
        fontSize: this.isMobile ? "12px" : "14px",
        fill: "#ffffff",
        fontFamily: "Arial",
        align: "center",
        wordWrap: { width: this.isMobile ? 300 : 520 }
      }).setOrigin(0.5);

      // Efectos hover
      button.on('pointerover', () => {
        if (!this.answered) {
          button.setFillStyle(0x0066cc, 1);
          this.tweens.add({
            targets: [button, text],
            scale: 1.05,
            duration: 200
          });
        }
      });

      button.on('pointerout', () => {
        if (!this.answered) {
          button.setFillStyle(0x003366, 0.8);
          this.tweens.add({
            targets: [button, text],
            scale: 1,
            duration: 200
          });
        }
      });

      button.on('pointerdown', () => this.handleAnswer(i, button, text));

      this.optionButtons.push({ button, text });
    }

    // Feedback text
    this.feedback = this.add.text(centerX, centerY + 150, "", {
      fontSize: this.isMobile ? "14px" : "16px",
      fill: "#ffffff",
      fontFamily: "Arial",
      align: "center",
      wordWrap: { width: this.isMobile ? 320 : 550 },
      lineSpacing: 6
    }).setOrigin(0.5);
  }

  handleAnswer(selectedIndex, button, text) {
    if (this.answered) return;

    this.answered = true;
    const isCorrect = selectedIndex === this.correctOption;

    // Deshabilitar todos los botones
    this.optionButtons.forEach(({ button: btn }) => {
      btn.removeInteractive();
    });

    if (isCorrect) {
      // Respuesta correcta
      button.setFillStyle(0x006600, 1);
      button.setStrokeStyle(3, 0x00ff00);

      this.feedback.setText(this.feedbackTexts[selectedIndex]);
      this.feedback.setStyle({ fill: "#00ff00" });

      // Efecto de éxito
      this.tweens.add({
        targets: [button, text],
        scale: 1.1,
        duration: 300,
        yoyo: true,
        repeat: 1
      });

      // Vibración de éxito
      if (this.isMobile && navigator.vibrate) {
        navigator.vibrate([100, 100, 100]);
      }

      // Transición a la siguiente escena
      this.time.delayedCall(4000, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start("DroneRepairScene");
        });
      });

    } else {
      // Respuesta incorrecta
      button.setFillStyle(0x660000, 1);
      button.setStrokeStyle(3, 0xff0000);

      this.feedback.setText(this.feedbackTexts[selectedIndex]);
      this.feedback.setStyle({ fill: "#ff6666" });

      // Efecto de error
      this.tweens.add({
        targets: [button, text],
        x: button.x + 10,
        duration: 100,
        yoyo: true,
        repeat: 3
      });

      // Vibración de error
      if (this.isMobile && navigator.vibrate) {
        navigator.vibrate(300);
      }

      // Permitir otro intento después de 3 segundos
      this.time.delayedCall(3000, () => {
        this.answered = false;
        this.optionButtons.forEach(({ button: btn }) => {
          if (btn !== button) {
            btn.setInteractive({ useHandCursor: true });
          }
        });
        this.feedback.setText("");
      });
    }
  }
}
