// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        //console.log(getXandY(e));
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        //console.log(getXandY(e));
        that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("wheel", function (e) {
        //console.log(getXandY(e));
        that.wheel = e;
        //       console.log(e.wheelDelta);
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
        //console.log(getXandY(e));
        that.rightclick = getXandY(e);
        e.preventDefault();
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
}

GameEngine.prototype.save = function () {
    var rtn = [];
    let id = 0;
    for (var i = 0; i < this.entities.length; i++) {
        var ent = this.entities[i];
        if (ent.id == null) {
            ent.id = id++;
        }
        //partner
        if (ent.hasPartner && ent.partner && ent.partner.id == null) {
            ent.partner.id = id++;
        }
        //parents
        if (ent.parents[0] != null && ent.parents[1] != null) {
            if(ent.parents[0].id == null) {
                ent.parents[0].id = id++;
            }
            if( ent.parents[1].id == null) {
                ent.parents[1].id = id++;
            }
        }
        //children
        for (var j = 0; j < ent.listOfChildren.length; j++) {
            var child = ent.listOfChildren[j];
            if (child.id == null) {
                child.id = id++;
            }
        }
        var entry = {
            //TODO set all of the other properties.
            id: ent.id,
            gender: ent.gender,
            age: ent.age,
            maxAge: ent.maxAge,
            hasMatured: ent.hasMatured,
            hasPartner: ent.hasPartner,
            partnerId: ent.partner ? ent.partner.id : null,
            children: ent.listOfChildren.map(x => x.id),
            parents: ent.parents[0] ? ent.parents.map(x => x.id) : null,
            colors: ent.colors,
            isAlive: ent.isAlive,
            isTerminallyIll: ent.isTerminallyIll,
            deathCountdown: ent.deathCountdown,
            maxChildren: ent.maxChildren,
            radar: ent.radar,
            reproductionWait: ent.reproductionWait,
            radius: ent.radius,
            visualRadius: ent.visualRadius,
            velocity: ent.velocity,
            x: ent.x,
            y: ent.y,
            removeFromWorld: ent.removeFromWorld
        }
        rtn.push(entry);
    }
    return rtn;
}

GameEngine.prototype.load = function (loadedEntities) {
    this.entities = [];
    //make the entity
    for (var i = 0; i < loadedEntities.length; i++) {
        var ent = loadedEntities[i];
        var person;
        if (ent.gender == "male") {
            person = new Male(this, null, null, 0, 0);
        } else {
            person = new Female(this, null, null, 0, 0);
        }
        person.listOfChildren = ent.children;
        person.partner = ent.partnerId;
        person.id = ent.id;
        person.parents = ent.parents ? ent.parents : person.parents;
        person.gender = ent.gender;
        person.age = ent.age
        person.maxAge = ent.maxAge
        person.hasMatured = ent.hasMatured
        person.hasPartner = ent.hasPartner
        person.colors = ent.colors;
        person.isAlive = ent.isAlive;
        person.isTerminallyIll = ent.isTerminallyIll;
        person.deathCountdown = ent.deathCountdown;
        person.maxChildren = ent.maxChildren;
        person.radar = ent.radar;
        person.reproductionWait = ent.reproductionWait;
        person.radius = ent.radius;
        person.visualRadius = ent.visualRadius;
        person.id = ent.id;
        person.velocity = ent.velocity;
        person.x = ent.x;
        person.y = ent.y;
        this.addEntity(person);
    }

    //add the references to the newly created objects
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if (entity.hasPartner) {
            entity.partner = this.entities.find(x => x.id == entity.partner);
        }
        if (entity.parents && entity.parents.length > 0) {
            entity.parents[0] = this.entities.find(x => x.id == entity.parents[0]);
            entity.parents[1] = this.entities.find(x => x.id == entity.parents[1]);
        }
        for (var j = 0; j < entity.listOfChildren.length; j++) {
            entity.listOfChildren[j] = this.entities.find(x => x.id == entity.listOfChildren[j]);
        }
    }
    //remove ids for later saving
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].id = null;
    }
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}
