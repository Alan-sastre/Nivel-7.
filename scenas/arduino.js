class ArduinoGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "ArduinoGameScene" });

    this.arduinoCodeStringArray = [
      "int motorPropulsion = 9;",
      "int sensorAltitud = A0;",
      "void setup() {",
      " pinMode(motorPropulsion, OUTPUT);",
      "}",
      "void loop() {",
      " int altitud = analogRead(sensorAltitud);",
      " if (altitud < 500) {",
      " digitalWrite(motorPropulsion, HIGH);",
      " }",
      "}",
    ];

    this.questionTextString = "¿Cuál es el error en este código?";

    this.optionsData = [
      {
        text: "(A) Falta definir sensorAltitud como entrada.",
        correct: false,
      },
      {
        text: "(B) El motor se mantiene encendido indefinidamente, sin control preciso.",
        correct: true,
      },
      {
        text: "(C) No hay ninguna condición para desactivar el propulsor.",
        correct: false,
      },
      {
        text: "(D) Se necesita usar digitalRead() en lugar de analogRead().",
        correct: false,
      },
    ];

    this.feedbackText = null;
    this.optionObjects = [];
    this.optionBackgrounds = []; // Para los fondos de las opciones
  }

  preload() {
    // Aquí puedes cargar assets si los necesitas
    // Por ejemplo: this.load.image('background', 'assets/background.png');
  }

  create() {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // --- Fondo de la Escena con Gradiente ---
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f1419, 0x0f1419, 0x1a2332, 0x1a2332, 1);
    bg.fillRect(0, 0, screenWidth, screenHeight);

    // Añadir partículas de fondo
    this.createBackgroundParticles();

    // --- Estilos de Texto Mejorados ---
    const titleStyle = {
      fontSize: "32px",
      fill: "#00d4ff",
      fontFamily: "Arial, sans-serif",
      align: "center",
      wordWrap: { width: screenWidth * 0.9 },
      stroke: "#001122",
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 5, fill: true },
    };
    const panelTitleStyle = {
      fontSize: "22px",
      fill: "#00ff88",
      fontFamily: "Arial, sans-serif",
      align: "left",
      fontWeight: "bold",
    };
    // Estilo para el bloque de código, manteniendo la fuente monoespaciada
    const codeStyle = {
      fontSize: "16px",
      fill: "#00ff88",
      fontFamily: 'Consolas, "Courier New", monospace',
      lineSpacing: 6,
      align: "left",
      wordWrap: { width: screenWidth / 2 - 70 },
      backgroundColor: "#0a0f14",
      padding: { x: 8, y: 4 },
    };
    const questionStyle = {
      fontSize: "22px",
      fill: "#ffaa00",
      fontFamily: "Arial, sans-serif",
      align: "left",
      wordWrap: { width: screenWidth / 2 - 80 },
      fontWeight: "bold",
      shadow: { offsetX: 1, offsetY: 1, color: "#000000", blur: 3, fill: true },
    };
    // Estilo base para el texto de las opciones
    const optionTextStyle = {
      fontSize: "17px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
      align: "center",
      wordWrap: { width: screenWidth / 2 - 120 },
      fontWeight: "500",
    };
    const feedbackStyle = {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: "Arial, sans-serif",
      align: "center",
      wordWrap: { width: screenWidth / 2 - 70 },
      padding: { y: 8 },
      fontWeight: "bold",
    };

    // --- Título General ---
    const mainTitle = this.add
      .text(
        screenWidth / 2,
        50,
        "🛰️ PROGRAMACIÓN DE NAVEGACIÓN AUTOMATIZADA",
        titleStyle
      )
      .setOrigin(0.5);

    // --- Panel Izquierdo: Código Arduino ---
    const leftPanelX = 20;
    const leftPanelY = 100;
    const leftPanelWidth = screenWidth / 2 - 30;
    const leftPanelHeight = screenHeight - 115;

    // Panel con gradiente y efectos
    const leftPanelBg = this.add.graphics();
    leftPanelBg.fillGradientStyle(0x1a2332, 0x1a2332, 0x0f1419, 0x0f1419, 1);
    leftPanelBg.fillRoundedRect(
      leftPanelX,
      leftPanelY,
      leftPanelWidth,
      leftPanelHeight,
      20
    );

    // Borde brillante
    leftPanelBg.lineStyle(3, 0x00d4ff, 0.8);
    leftPanelBg.strokeRoundedRect(
      leftPanelX,
      leftPanelY,
      leftPanelWidth,
      leftPanelHeight,
      20
    );

    // Efecto de brillo interno
    leftPanelBg.lineStyle(1, 0x00ff88, 0.3);
    leftPanelBg.strokeRoundedRect(
      leftPanelX + 5,
      leftPanelY + 5,
      leftPanelWidth - 10,
      leftPanelHeight - 10,
      15
    );

    // Título del panel con icono
    const codeTitle = this.add.text(
      leftPanelX + 20,
      leftPanelY + 15,
      "💻 Código a Analizar:",
      panelTitleStyle
    );

    // Fondo del código
    const codeBg = this.add.graphics();
    codeBg.fillStyle(0x0a0f14, 0.9);
    codeBg.fillRoundedRect(
      leftPanelX + 15,
      leftPanelY + 45,
      leftPanelWidth - 30,
      leftPanelHeight - 60,
      10
    );

    const codeText = this.add.text(
      leftPanelX + 25,
      leftPanelY + 55,
      this.arduinoCodeStringArray.join("\n"),
      codeStyle
    );

    // --- Panel Derecho: Pregunta y Opciones ---
    const rightPanelX = screenWidth / 2 + 10;
    const rightPanelY = 100;
    const rightPanelWidth = screenWidth / 2 - 30;
    const rightPanelHeight = screenHeight - 120;

    // Panel con gradiente
    const rightPanelBg = this.add.graphics();
    rightPanelBg.fillGradientStyle(0x1a2332, 0x1a2332, 0x0f1419, 0x0f1419, 1);
    rightPanelBg.fillRoundedRect(
      rightPanelX,
      rightPanelY,
      rightPanelWidth,
      rightPanelHeight,
      20
    );

    // Borde brillante
    rightPanelBg.lineStyle(3, 0xffaa00, 0.8);
    rightPanelBg.strokeRoundedRect(
      rightPanelX,
      rightPanelY,
      rightPanelWidth,
      rightPanelHeight,
      20
    );

    // Efecto de brillo interno
    rightPanelBg.lineStyle(1, 0x00ff88, 0.3);
    rightPanelBg.strokeRoundedRect(
      rightPanelX + 5,
      rightPanelY + 5,
      rightPanelWidth - 10,
      rightPanelHeight - 10,
      15
    );

    // Pregunta con icono
    const questionText = this.add.text(
      rightPanelX + 20,
      rightPanelY + 15,
      "❓ " + this.questionTextString,
      questionStyle
    );

    let optionStartY = rightPanelY + 75; // Espacio después de la pregunta
    const optionHeight = 45; // Alto de cada botón de opción
    const optionSpacingY = 15; // Espacio vertical entre opciones
    const optionButtonWidth = rightPanelWidth - 40; // Ancho del botón de opción

    this.optionObjects = [];
    this.optionBackgrounds = [];

    this.optionsData.forEach((option, index) => {
      const optX = rightPanelX + 20;
      const optY = optionStartY + index * (optionHeight + optionSpacingY);

      // Fondo del botón de opción con gradiente
      const optionBg = this.add.graphics();
      optionBg.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1);
      optionBg.fillRoundedRect(optX, optY, optionButtonWidth, optionHeight, 12);

      // Borde sutil
      optionBg.lineStyle(2, 0x00d4ff, 0.6);
      optionBg.strokeRoundedRect(
        optX,
        optY,
        optionButtonWidth,
        optionHeight,
        12
      );

      // Guardar las coordenadas y dimensiones en el objeto gráfico para usarlas después
      optionBg.x = optX;
      optionBg.y = optY;
      optionBg.width = optionButtonWidth;
      optionBg.height = optionHeight;

      this.optionBackgrounds.push(optionBg);

      // Texto de la opción
      const optionLabel = this.add
        .text(
          optX + optionButtonWidth / 2,
          optY + optionHeight / 2,
          option.text,
          optionTextStyle
        )
        .setOrigin(0.5);

      // Crear una zona interactiva explícita que cubra exactamente el área del botón
      const zone = this.add
        .zone(optX, optY, optionButtonWidth, optionHeight)
        .setOrigin(0)
        .setInteractive()
        .on("pointerdown", () => {
          this.handleAnswer(option.correct, optionLabel, optionBg, zone);
        })
        .on("pointerover", () => {
          // Efecto de animación al pasar el ratón
          this.tweens.add({
            targets: optionLabel,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 150,
            ease: "Back.easeOut",
          });

          // Efecto de brillo en el fondo con gradiente
          optionBg.clear();
          optionBg.fillGradientStyle(0x00d4ff, 0x00d4ff, 0x0099cc, 0x0099cc, 1);
          optionBg.fillRoundedRect(
            optX,
            optY,
            optionButtonWidth,
            optionHeight,
            12
          );

          // Añadir un borde brillante animado
          optionBg.lineStyle(3, 0xffaa00, 1);
          optionBg.strokeRoundedRect(
            optX,
            optY,
            optionButtonWidth,
            optionHeight,
            12
          );
        })
        .on("pointerout", () => {
          // Revertir la animación al quitar el ratón
          this.tweens.add({
            targets: optionLabel,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: "Back.easeIn",
          });

          // Volver al color original con gradiente
          optionBg.clear();
          optionBg.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1);
          optionBg.fillRoundedRect(
            optX,
            optY,
            optionButtonWidth,
            optionHeight,
            12
          );

          // Borde sutil
          optionBg.lineStyle(2, 0x00d4ff, 0.6);
          optionBg.strokeRoundedRect(
            optX,
            optY,
            optionButtonWidth,
            optionHeight,
            12
          );
        });

      optionLabel.setData("optionBg", optionBg);
      optionLabel.setData("zone", zone);
      this.optionObjects.push(optionLabel);
    });

    // --- Espacio para Feedback (debajo de las opciones) ---
    const feedbackY =
      optionStartY +
      this.optionsData.length * (optionHeight + optionSpacingY) +
      15;
    this.feedbackText = this.add
      .text(rightPanelX + rightPanelWidth / 2, feedbackY, "", feedbackStyle)
      .setOrigin(0.5, 0);
  }

  handleAnswer(isCorrect, selectedOptionLabel, selectedOptionBg, selectedZone) {
    // Si la zona ya está deshabilitada, no hacer nada
    if (selectedZone.input && !selectedZone.input.enabled) {
      return;
    }

    const correctColor = 0x00ff88; // Verde brillante para correcto
    const incorrectColor = 0xff4444; // Rojo brillante para incorrecto
    const disabledColor = 0x555566; // Gris oscuro para deshabilitado
    const disabledTextColor = "#aaaaaa"; // Gris claro para texto deshabilitado
    const correctTextColor = "#ffffff"; // Texto blanco para mejor contraste

    if (isCorrect) {
      // Respuesta correcta con efectos
      selectedOptionBg.clear();
      selectedOptionBg.fillGradientStyle(
        correctColor,
        correctColor,
        0x00cc66,
        0x00cc66,
        1
      );
      selectedOptionBg.fillRoundedRect(
        selectedOptionBg.x,
        selectedOptionBg.y,
        selectedOptionBg.width,
        selectedOptionBg.height,
        12
      );

      // Borde brillante para respuesta correcta
      selectedOptionBg.lineStyle(3, 0xffffff, 1);
      selectedOptionBg.strokeRoundedRect(
        selectedOptionBg.x,
        selectedOptionBg.y,
        selectedOptionBg.width,
        selectedOptionBg.height,
        12
      );

      selectedOptionLabel.setStyle({
        fill: correctTextColor,
        fontWeight: "bold",
      });

      // Deshabilitar todas las zonas solo cuando la respuesta es correcta
      this.optionObjects.forEach((optLabel, idx) => {
        const optBg = this.optionBackgrounds[idx];
        const zone = optLabel.getData("zone");

        if (zone && zone.input) {
          zone.disableInteractive();
        }

        if (optLabel !== selectedOptionLabel) {
          optBg.clear();
          optBg.fillGradientStyle(
            disabledColor,
            disabledColor,
            0x444455,
            0x444455,
            0.7
          );
          optBg.fillRoundedRect(
            optBg.x,
            optBg.y,
            optBg.width,
            optBg.height,
            12
          );
          optLabel.setStyle({ fill: disabledTextColor });
        }
      });

      if (this.feedbackText) {
        this.feedbackText.setText("¡Correcto! ✅\nEse es el error principal.");
        this.feedbackText.setStyle({ fill: "#2ecc71" });
      }

      // Esperar 2 segundos y luego mostrar el código correcto
      this.time.delayedCall(2000, () => {
        // Limpiar toda la pantalla
        this.children.removeAll(true);

        // Fondo con gradiente moderno
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f1419, 0x0f1419, 0x1a2332, 0x1a2332, 1);
        bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // Estilos modernos para el código correcto
        const titleStyle = {
          fontSize: "28px",
          fill: "#00d4ff",
          fontFamily: "Arial, sans-serif",
          align: "center",
          stroke: "#001122",
          strokeThickness: 2,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: "#000000",
            blur: 5,
            fill: true,
          },
        };
        const codeStyle = {
          fontSize: "14px",
          fill: "#00ff88",
          fontFamily: 'Consolas, "Courier New", monospace',
          lineSpacing: 5,
          align: "left",
        };

        // Mostrar el título
        this.add
          .text(
            this.cameras.main.width / 2,
            30,
            "✅ SOLUCIÓN CORRECTA",
            titleStyle
          )
          .setOrigin(0.5);

        // Panel principal para el código
        const codePanelX = this.cameras.main.width / 2 - 300;
        const codePanelY = 70;
        const codePanelWidth = 600;
        const codePanelHeight = 420;

        // Panel con gradiente y efectos modernos
        const codePanelBg = this.add.graphics();
        codePanelBg.fillGradientStyle(
          0x1a2332,
          0x1a2332,
          0x0f1419,
          0x0f1419,
          1
        );
        codePanelBg.fillRoundedRect(
          codePanelX,
          codePanelY,
          codePanelWidth,
          codePanelHeight,
          20
        );

        // Borde brillante
        codePanelBg.lineStyle(3, 0x00d4ff, 0.8);
        codePanelBg.strokeRoundedRect(
          codePanelX,
          codePanelY,
          codePanelWidth,
          codePanelHeight,
          20
        );

        // Efecto de brillo interno
        codePanelBg.lineStyle(1, 0x00ff88, 0.3);
        codePanelBg.strokeRoundedRect(
          codePanelX + 5,
          codePanelY + 5,
          codePanelWidth - 10,
          codePanelHeight - 10,
          15
        );

        // Barra superior moderna para el lenguaje
        const headerHeight = 35;
        const headerBg = this.add.graphics();
        headerBg.fillGradientStyle(0x0f1419, 0x0f1419, 0x1a2332, 0x1a2332, 1);
        headerBg.fillRoundedRect(
          codePanelX,
          codePanelY,
          codePanelWidth,
          headerHeight,
          { tl: 20, tr: 20, bl: 0, br: 0 }
        );

        // Línea separadora
        const separatorLine = this.add.graphics();
        separatorLine.lineStyle(2, 0x00d4ff, 0.6);
        separatorLine.lineBetween(
          codePanelX + 10,
          codePanelY + headerHeight,
          codePanelX + codePanelWidth - 10,
          codePanelY + headerHeight
        );

        // Etiqueta de lenguaje moderna
        this.add
          .text(
            codePanelX + 25,
            codePanelY + headerHeight / 2,
            "💻 Arduino C++",
            {
              fontSize: "16px",
              fill: "#ffaa00",
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
            }
          )
          .setOrigin(0, 0.5);

        // Código correcto
        const correctCode = [
          "int motorPropulsion = 9;",
          "int sensorAltitud = A0;",
          "",
          "void setup() {",
          "  pinMode(sensorAltitud, INPUT);",
          "  pinMode(motorPropulsion, OUTPUT);",
          "}",
          "",
          "void loop() {",
          "  int altitud = analogRead(sensorAltitud);",
          "  if (altitud < 500) {",
          "    digitalWrite(motorPropulsion, HIGH);",
          "  } else {",
          "    digitalWrite(motorPropulsion, LOW); // Se apaga el motor si la altitud es segura",
          "  }",
          "}",
        ];

        // Fondo del área de código
        const codeAreaBg = this.add.graphics();
        codeAreaBg.fillStyle(0x0a0f14, 0.9);
        codeAreaBg.fillRoundedRect(
          codePanelX + 15,
          codePanelY + headerHeight + 10,
          codePanelWidth - 30,
          codePanelHeight - headerHeight - 25,
          10
        );

        // Mostrar el código con números de línea
        this.add.text(
          codePanelX + 55,
          codePanelY + headerHeight + 20,
          correctCode.join("\n"),
          codeStyle
        );

        // Números de línea con estilo moderno
        let lineNumbers = "";
        for (let i = 1; i <= correctCode.length; i++) {
          lineNumbers += i + "\n";
        }
        const lineNumberStyle = {
          fontSize: "14px",
          fill: "#666677",
          fontFamily: 'Consolas, "Courier New", monospace',
          lineSpacing: 5,
          align: "right",
        };
        this.add
          .text(
            codePanelX + 40,
            codePanelY + headerHeight + 20,
            lineNumbers,
            lineNumberStyle
          )
          .setOrigin(1, 0);

        // Panel de explicación moderno
        const explanationPanelY = codePanelY + codePanelHeight + 20;
        const explanationBg = this.add.graphics();
        explanationBg.fillGradientStyle(
          0x1a2332,
          0x1a2332,
          0x0f1419,
          0x0f1419,
          1
        );
        explanationBg.fillRoundedRect(
          codePanelX,
          explanationPanelY,
          codePanelWidth,
          80,
          15
        );
        explanationBg.lineStyle(2, 0x00ff88, 0.6);
        explanationBg.strokeRoundedRect(
          codePanelX,
          explanationPanelY,
          codePanelWidth,
          80,
          15
        );

        const explanationStyle = {
          fontSize: "18px",
          fill: "#ffffff",
          fontFamily: "Arial, sans-serif",
          align: "center",
          wordWrap: { width: 550 },
          fontWeight: "bold",
        };
        this.add
          .text(
            this.cameras.main.width / 2,
            explanationPanelY + 40,
            "✅ ¡Perfecto! Ahora el satélite ajustará su órbita de manera autónoma.",
            explanationStyle
          )
          .setOrigin(0.5);

        // Botón moderno para continuar
        const buttonY = this.cameras.main.height - 60;
        const buttonBg = this.add.graphics();
        buttonBg.fillGradientStyle(0x00d4ff, 0x00d4ff, 0x0099cc, 0x0099cc, 1);
        buttonBg.fillRoundedRect(
          this.cameras.main.width / 2 - 120,
          buttonY - 20,
          240,
          40,
          20
        );
        buttonBg.lineStyle(2, 0xffffff, 0.8);
        buttonBg.strokeRoundedRect(
          this.cameras.main.width / 2 - 120,
          buttonY - 20,
          240,
          40,
          20
        );

        const continueMessage = this.add
          .text(this.cameras.main.width / 2, buttonY, "🚀 CONTINUAR", {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            align: "center",
          })
          .setOrigin(0.5)
          .setDepth(1000);

        // Click en cualquier parte para continuar
        this.input.once(
          "pointerdown",
          () => {
            this.scene.start("Rompecabezas"); // Cambia el nombre si tu siguiente escena tiene otro key
          },
          this
        );
      });
    } else {
      // Respuesta incorrecta con efectos
      selectedOptionBg.clear();
      selectedOptionBg.fillGradientStyle(
        incorrectColor,
        incorrectColor,
        0xcc3333,
        0xcc3333,
        1
      );
      selectedOptionBg.fillRoundedRect(
        selectedOptionBg.x,
        selectedOptionBg.y,
        selectedOptionBg.width,
        selectedOptionBg.height,
        12
      );

      // Borde para respuesta incorrecta
      selectedOptionBg.lineStyle(2, 0xffffff, 0.8);
      selectedOptionBg.strokeRoundedRect(
        selectedOptionBg.x,
        selectedOptionBg.y,
        selectedOptionBg.width,
        selectedOptionBg.height,
        12
      );

      selectedOptionLabel.setStyle({
        fill: correctTextColor,
        fontWeight: "bold",
      });

      // NO deshabilitar la zona para permitir intentar de nuevo
      // Solo mostrar feedback visual temporal
      
      if (this.feedbackText) {
        this.feedbackText.setText("Incorrecto. ❌\nIntenta con otra opción.");
        this.feedbackText.setStyle({ fill: "#e74c3c" });
      }

      // Restaurar el color original después de 1.5 segundos
      this.time.delayedCall(1500, () => {
        selectedOptionBg.clear();
        selectedOptionBg.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1);
        selectedOptionBg.fillRoundedRect(
          selectedOptionBg.x,
          selectedOptionBg.y,
          selectedOptionBg.width,
          selectedOptionBg.height,
          12
        );
        selectedOptionBg.lineStyle(2, 0x00d4ff, 0.6);
        selectedOptionBg.strokeRoundedRect(
          selectedOptionBg.x,
          selectedOptionBg.y,
          selectedOptionBg.width,
          selectedOptionBg.height,
          12
        );
        
        selectedOptionLabel.setStyle({
          fill: "#e0e0e0",
          fontWeight: "normal"
        });
        
        // Limpiar el feedback
        if (this.feedbackText) {
          this.feedbackText.setText("");
        }
      });
    }
  }

  createBackgroundParticles() {
    // Crear partículas de fondo para efecto visual
    for (let i = 0; i < 20; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x00d4ff, 0.3);
      particle.fillCircle(0, 0, Math.random() * 3 + 1);

      particle.x = Math.random() * this.cameras.main.width;
      particle.y = Math.random() * this.cameras.main.height;

      // Animación de flotación
      this.tweens.add({
        targets: particle,
        y: particle.y - 50,
        alpha: 0,
        duration: Math.random() * 3000 + 2000,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: Math.random() * 2000,
      });

      // Movimiento horizontal sutil
      this.tweens.add({
        targets: particle,
        x: particle.x + (Math.random() * 40 - 20),
        duration: Math.random() * 4000 + 3000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  update() {}
}
