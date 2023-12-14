function Game() {
    this.field = document.getElementsByClassName("field")[0];
    this.fieldX = 40;  // Task-given value
    this.fieldY = 24;  // Task-given value
    this.fieldScaleX = getComputedStyle(this.field).width.replace("px", '') / this.fieldX;
    this.fieldScaleY = getComputedStyle(this.field).height.replace("px", '')  / this.fieldY;

    this.minAmountOfChambers = 5;   // Task-given value
    this.maxAmountOfChambers = 10;  // Task-given value
    this.minChamberSize = 3;  // Task-given value
    this.maxChamberSize = 8;  // Task-given value

    this.minAmountOfRoutes = 3;  // Task-given value
    this.maxAmountOfRoutes = 5;  // Task-given value
    this.routesX = [];
    this.routesY = [];

    this.swordsAmount = 2;          // Task-given value
    this.healthPotionsAmount = 10;  // Task-given value
    this.enemiesAmount = 10;        // Task-given value
    this.entitiesClasses = ["tileW", "tileP", "tileE", "tileHP", "tileSW"];
    this.entitiesAlive = ["tileP", "tileE"];

    this.enemiesSlayed = 0;
    this.enemyDamage = 5;
    this.HPPerHealthPotion = 25;
    this.swordDamageMultiplier = 2.5;

    this.init = function () {
        this._generateField();
        this._generateRoutes();
        this._generateChambers();
        this._drawEntities("tileSW", this.swordsAmount);
        this._drawEntities("tileHP", this.healthPotionsAmount);
        this._drawEntities("tileE", this.enemiesAmount);
        this._drawEntities("tileP", 1);

        this.player = new Player(this.field);

        this._bindedEventHandler = this._eventHandler.bind(this);
        document.addEventListener("keyup", this._bindedEventHandler);
    }

    this._generateField = function () {
        for (let y = 0; y < this.fieldY; y++) {
            for (let x = 0; x < this.fieldX; x++) {
                let tile = document.createElement("div");
                tile.className = "tile tileW";
                this.field.appendChild(tile);

                tile.style.width = this.fieldScaleX + "px";
                tile.style.height = this.fieldScaleY + "px";
                tile.style.left = x * this.fieldScaleX + "px";
                tile.style.top = y * this.fieldScaleY + "px";
            }
        }
    }

    this._getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    this._generateChambers = function () {
        let amountOfChambers = this._getRandomInt(this.minAmountOfChambers, this.maxAmountOfChambers);

        for (let chamberNumber = 0; chamberNumber < amountOfChambers; chamberNumber++) {
            let chamberWidth = this._getRandomInt(this.minChamberSize, this.maxChamberSize);
            let chamberHeight = this._getRandomInt(this.minChamberSize, this.maxChamberSize);

            let chamberX;
            let chamberY;
            let unaccessibleChamber = true;
            
            while (unaccessibleChamber) {
                chamberX = this._getRandomInt(1, this.fieldX - chamberWidth);
                chamberY = this._getRandomInt(0, this.fieldY - 1 - chamberHeight);

                for (const routeX of this.routesX) {
                    if ((routeX >= chamberX) && (routeX <= chamberX + chamberWidth)) {
                        unaccessibleChamber = false;
                        break;
                    }
                }

                for (const routeY of this.routesY) {
                    if ((routeY >= chamberY) && (routeY <= chamberY + chamberHeight)) {
                        unaccessibleChamber = false;
                        break;
                    }
                }
            }
            
            for (let y = chamberY; y < chamberY + chamberHeight; y++) {
                for (let x = chamberX; x < chamberX + chamberWidth; x++) {
                    let tile = document.querySelector(".field :nth-child(" + (this.fieldX * y + x) + ")");
                    tile.className = "tile";
                }
            }
        }
    }

    this._generateRoutes = function () {
        let amountOfHorizontalRoutes = this._getRandomInt(this.minAmountOfRoutes, this.maxAmountOfRoutes);
        let amountOfVerticalRoutes = this._getRandomInt(this.minAmountOfRoutes, this.maxAmountOfRoutes);

        let horizontalRoutes = [];
        for (let horizontalRouteNumber = 0; horizontalRouteNumber < amountOfHorizontalRoutes; horizontalRouteNumber++) {
            let routeY = this._getRandomInt(0, this.fieldY - 1);
            while (horizontalRoutes.includes(routeY)) {
                routeY = this._getRandomInt(0, this.fieldY - 1);
            }
            horizontalRoutes.push(routeY, routeY - 1, routeY + 1);
            this.routesY.push(routeY);

            for (let x = 1; x <= this.fieldX; x++) {
                let tile = document.querySelector(".field :nth-child(" + (this.fieldX * routeY + x) + ")");
                tile.className = "tile";
            }
        }
        
        let verticalRoutes = [];
        for (let verticalRouteNumber = 0; verticalRouteNumber < amountOfVerticalRoutes; verticalRouteNumber++) {
            let routeX = this._getRandomInt(1, this.fieldX);
            while (verticalRoutes.includes(routeX)) {
                routeX = this._getRandomInt(1, this.fieldX);
            }
            verticalRoutes.push(routeX, routeX - 1, routeX + 1);
            this.routesX.push(routeX);

            for (let y = 0; y < this.fieldY; y++) {
                let tile = document.querySelector(".field :nth-child(" + (this.fieldX * y + routeX) + ")");
                tile.className = "tile";
            }
        }
    }

    this._addHealthBar = function (entity) {
        let healthBar = document.createElement("div");
        healthBar.className = "health";
        healthBar.style.width = "100%";
        entity.appendChild(healthBar);
    }

    this._drawEntities = function (type, amount) {
        let newTileClass = "tile" + " " + type;
        let emptyTiles = Array.from(document.querySelectorAll(".tile:not(." + this.entitiesClasses.join("):not(.") + ")"));
        for (let entityNumber = 0; entityNumber < amount; entityNumber++) {
            let tileIndex = this._getRandomInt(0, emptyTiles.length - 1);
            emptyTiles[tileIndex].className = newTileClass;
            if (this.entitiesAlive.includes(type)) {
                this._addHealthBar(emptyTiles[tileIndex]);
            }
            emptyTiles.splice(tileIndex, 1);
        }
    }

    this._updateHealthBar = function (healthBar, percent) {
        healthBar.style.width = Math.max(0, Math.min(100, Number(healthBar.style.width.replace('%', '')) + percent)) + "%";
    }

    this._moveCharacter = function (coordinateShift) {
        let aimTile = this.field.children[this.player.position+coordinateShift];

        let checkFlag;
        if (Math.abs(coordinateShift) === this.fieldX) {   // W S
            checkFlag = ((this.player.position+coordinateShift) > 0) && ((this.player.position+coordinateShift) < this.field.children.length);
        }
        if (Math.abs(coordinateShift) === 1) {             // A D
            let currentRow = Math.floor(this.player.position / this.fieldX);
            let aimRow = Math.floor((this.player.position + coordinateShift) / this.fieldX);
            checkFlag = currentRow === aimRow;
        }
        checkFlag = checkFlag && (aimTile.className !== "tile tileE") && (aimTile.className !== "tile tileW");

        if (checkFlag) {
            if (aimTile.className === "tile tileHP") {
                this._updateHealthBar(this.field.children[this.player.position].firstChild, this.HPPerHealthPotion);
            }
            if (aimTile.className === "tile tileSW") {
                this.player.damage *= this.swordDamageMultiplier;
            }
            aimTile.className = "tile tileP";
            this.field.children[this.player.position].className = "tile";
            aimTile.appendChild(this.field.children[this.player.position].firstChild);
            this.player.position += coordinateShift;
            this._enemiesTurn();
        }
    }

    this._getAttackingTiles = function (position) {
        let attackTiles = [];
        if (position-this.fieldX >= 0) { attackTiles.push(this.field.children[position-this.fieldX]); }
        if ((position-1 >= 0) && (((position-1) % this.fieldX) != (this.fieldX-1))) { attackTiles.push(this.field.children[position-1]); }
        if (position+this.fieldX < this.fieldX * this.fieldY) { attackTiles.push(this.field.children[position+this.fieldX]); }
        if ((position+1 < this.fieldX * this.fieldY) && (((position+1) % this.fieldX) != 0)) { attackTiles.push(this.field.children[position+1]); }
        return attackTiles;
    }

    this._attackEntity = function (attackingTiles, enemy, damage) {
        for (const attackTile of attackingTiles) {
            if (attackTile.className === ("tile " + enemy)) {
                this._updateHealthBar(attackTile.firstChild, -damage);
                if (Number(attackTile.firstChild.style.width.replace('%', '')) === 0) {
                    attackTile.className = "tile";
                    attackTile.removeChild(attackTile.firstChild);
                    if (enemy === "tileE") {
                        this.enemiesSlayed += 1;
                        if (this.enemiesSlayed === this.enemiesAmount) {
                            document.removeEventListener("keyup", this._bindedEventHandler);
                            alert("YOU WON!");
                        }
                    } else if (enemy === "tileP") {
                        document.removeEventListener("keyup", this._bindedEventHandler);
                        alert("GAME OVER!");
                    }
                }
                if (enemy == "tileP") { return true; }
            }
        }
    }

    this._eventHandler = function (event) {
        switch (event.code) {
            case "KeyW":
                this._moveCharacter(-this.fieldX)
                break;
            case "KeyA":
                this._moveCharacter(-1)
                break;
            case "KeyS":
                this._moveCharacter(this.fieldX)
                break;
            case "KeyD":
                this._moveCharacter(1)
                break;
            case "Space":
                this._attackEntity(this._getAttackingTiles(this.player.position), "tileE", this.player.damage);
                this._enemiesTurn();
                break;
        }
    }

    this._getAllIndicies = function (arr, val) {
        let indicies = [], i = -1;
        while ((i = arr.indexOf(val, i+1)) != -1){
            indicies.push(i);
        }
        return indicies;
    }

    this._enemiesTurn = function () {
        let attacked = false;
        let enemiesPositions = this._getAllIndicies(Array.from(this.field.children).map(function(x) { return x.className.split(" ").includes("tileE"); }), true);

        for (const enemyPosition of enemiesPositions) {
            let attackTiles = this._getAttackingTiles(enemyPosition);
            attacked = this._attackEntity(attackTiles, "tileP", this.enemyDamage)

            if (!attacked) {
                let possibleTiles = [];
                for (const possibleTile of attackTiles) {
                    if (["tile", "tile tileHP", "tile tileSW"].includes(possibleTile.className)) {
                        possibleTiles.push(possibleTile);
                    }
                }

                if (possibleTiles.length !== 0) {
                    let aimTile = possibleTiles[this._getRandomInt(0, possibleTiles.length-1)];
                    this.field.children[enemyPosition].className = this.field.children[enemyPosition].className.replace(" tileE", '');
                    this.field.children[enemyPosition].style.backgroundImage = "";
                    aimTile.appendChild(this.field.children[enemyPosition].firstChild);
                    aimTile.className += " tileE";
                    aimTile.style.backgroundImage = this.modifiedEnemyImage;
                }
            }
        }
    }
}

function Player(field) {
    this.position = Array.from(field.children).map(function(x) { return x.className; }).indexOf("tile tileP");
    this.damage = 10;
}