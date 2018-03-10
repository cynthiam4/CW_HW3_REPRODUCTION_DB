
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
var socket = io.connect("http://24.16.255.56:8888");

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    for (let i = 0; i < 8; i++) {
        gameEngine.addEntity(new Female(gameEngine, null, null,
            Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight)));
    }
    for (let i = 0; i < 8; i++) {
        gameEngine.addEntity(new Male(gameEngine, null,
            null, Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight)));
    }
    gameEngine.init(ctx);
    gameEngine.start();
    socket.on("load", function (data) {
        gameEngine.load(data.data);
        console.log(data.data);
    });
    var save = document.getElementById("save");
    var load = document.getElementById("load");

    save.onclick = function () {
        socket.emit("save", { studentname: "Cynthia Mora", statename: "saveState", data: gameEngine.save() });
        console.log("dataSaved");
    };

    load.onclick = function () {
        socket.emit("load", { studentname: "Cynthia Mora", statename: "saveState" });
    };
    console.log("All Done!");

});
