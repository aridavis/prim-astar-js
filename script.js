let sizeX = 11;
let sizeY = 11;
let isRunning = false;

var nX = [0, 2, 0, -2];
var nY = [2, 0, -2, 0];


var frontiers = new Array();

class Node {
    constructor(y, x) {
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.x = x;
        this.y = y;
        this.passage = false;
        this.aStarParent = null;
        this.aStarVisited = null;
        this.parent = null;
    }
}

function initArray() {
    var array = new Array(sizeY);
    for (let i = 0; i < sizeY; i++) {
        array[i] = new Array(sizeX);
    }
    return array;
}

function initMap() {
    for (let i = 0; i < sizeY; i++) {
        for (let j = 0; j < sizeX; j++) {
            map[i][j] = new Node(i, j);
        }
    }
}

function visit(desty, destx) {
    map[desty][destx].passage = true;
}

function getXDifference(parent, curr) {
    if (parent.x - curr.x < 0) {
        return -1;
    }
    if (parent.x - curr.x > 0) {
        return 1;
    }
    return 0;
}

function getYDifference(parent, curr) {
    if (parent.y - curr.y < 0) {
        return -1;
    }
    if (parent.y - curr.y > 0) {
        return 1;
    }
    return 0;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function prim() {
    var startX = 0;
    var startY = 0;

    var currX = startX;
    var currY = startY;

    frontiers.push(map[startY][startX]);

    var idx = 0;

    for (let i = 0; i < 4; i++) {
        if (currX + nX[i] < 0 || currX + nX[i] >= sizeX || currY + nY[i] < 0 || currY + nY[i] >= sizeY || map[currY + nY[i]][currX + nX[i]].passage == true) {
            continue;
        }
        map[currY + nY[i]][currX + nX[i]].parent = map[currY][currX];
        frontiers.push(map[currY + nY[i]][currX + nX[i]]);
    }
    while (frontiers.length > 0) {
        // console.log("Running")
        currY = frontiers[idx].y;
        currX = frontiers[idx].x;
        if (map[currY][currX].passage === true) {
            frontiers.splice(idx, 1);
            idx = Math.floor(Math.random() * frontiers.length);
            continue;
        }
        if (map[currY][currX].parent !== null) {
            var dirX = getXDifference(map[currY][currX].parent, map[currY][currX]);
            var dirY = getYDifference(map[currY][currX].parent, map[currY][currX]);
            if (!(currX + dirX < 0 || currX + dirX >= sizeX || currY + dirY < 0 || currY + dirY >= sizeY || map[currY + dirY][currX + dirX].passage == true)) {
                map[currY + dirY][currX + dirX].passage = true;
            }
        }
        visit(currY, currX);
        //Add Frontier
        for (let i = 0; i < 4; i++) {
            if (currX + nX[i] < 0 || currX + nX[i] >= sizeX || currY + nY[i] < 0 || currY + nY[i] >= sizeY || map[currY + nY[i]][currX + nX[i]].passage == true) {
                continue;
            }
            map[currY + nY[i]][currX + nX[i]].parent = map[currY][currX];
            frontiers.push(map[currY + nY[i]][currX + nX[i]]);
        }
        frontiers.splice(idx, 1);
        idx = Math.floor(Math.random() * frontiers.length);
        // idx = 0;
        isRunning = true;
        await sleep(3000 / (sizeX * sizeY));
        convertToButton();
    }
    isRunning = false;
}

function convertToButton() {
    var container = document.getElementById("maze-container");
    container.innerHTML = "";
    var script = "";
    for (let i = 0; i < sizeY; i++) {
        script += '<div class="row">\n';
        for (let j = 0; j < sizeX; j++) {
            if (map[i][j].passage) {
                script += ('<button class="tile facade" id="' + i + '_' + j + '" onClick="settingCharacter(this.id)"></button>\n')
            }
            else {
                script += ('<button class="tile block" id="' + i + '_' + j + '")></button>\n')
            }
        }
        script += '</div>\n';
    }
    container.innerHTML = script;
}

var startPosX = -1;
var startPosY = -1;

var endPosX = -1;
var endPosY = -1;

function clearUI() {
    convertToButton();
    clearMaze();
    isCleared = true;
    startPosX = startPosY = endPosX = endPosY = -1;
}

function settingCharacter(id) {
    if (isRunning == false) {
        var xy = id.split("_");
        var y = xy[0];
        var x = xy[1];
        var tile = document.getElementById(id);
        if (startPosX == -1 && startPosY == -1 && y != endPosY && x != endPosX) {
            startPosY = y;
            startPosX = x;
            tile.className = "tile passage start";
        }
        else if (endPosX == -1 && endPosY == -1 && y != startPosY && x != startPosX) {
            convertToButton();
            clearMaze();
            endPosY = y;
            endPosX = x;

            // tile.className = "tile passage end";
            tile.className = "tile passage end";
            document.getElementById(startPosY + "_" + startPosX).className = "tile passage start"
            document.getElementById(y + "_" + x).className = "tile passage end"
            astar();
        }
        else if (startPosX == x && startPosY == y && y != endPosY && x != endPosX) {
            convertToButton();
            clearMaze();
            endPosX = endPosY = -1;
            tile.className = "tile passage white";
            startPosX = startPosY = -1;
        }
        else if (endPosX == x && endPosY == y && y != startPosY && x != startPosX) {
            tile.className = "tile passage white";
            convertToButton();
            clearMaze();
            document.getElementById(startPosY + "_" + startPosX).className = "tile passage start"
            endPosX = endPosY = -1;
        }
        else if (endPosX != -1 && endPosY != -1 && startPosX != -1 && startPosY != -1) {
            convertToButton();
            clearMaze();
            endPosX = x;
            endPosY = y;

            tile.className = "tile passage end";
            document.getElementById(startPosY + "_" + startPosX).className = "tile passage start"
            document.getElementById(y + "_" + x).className = "tile passage end"
            astar();
        }
    }

}

function heuristic(y, x) {
    return Math.sqrt(Math.pow(endPosY - y, 2) + Math.pow(endPosX - x, 2));
}
var queue = new Array();

function sort() {
    for (let i = 0; i < queue.length; i++) {
        for (let j = 0; j < queue.length - 1; j++) {
            if (queue[j + 1].f < queue[j].f) {
                var temp = queue[j + 1];
                queue[j + 1] = queue[j];
                queue[j] = temp;
            }
        }
    }
}

function aStarVisit(y, x) {
    map[y][x].aStarVisited = true;
}

async function astar() {
    isCleared = true;
    queue = []
    console.log(queue.length);
    var startX = startPosX;
    var startY = startPosY;
    queue.push(map[startY][startX]);

    while (queue.length > 0) {
        sort();
        var currX = queue[0].x;
        var currY = queue[0].y;
        aStarVisit(currY, currX);

        queue.splice(0, 1);

        var currTile = map[currY][currX];
        var nx = [1, 0, -1, 0];
        var ny = [0, 1, 0, -1];

        if (currX == endPosX && currY == endPosY) {
            break;
        }

        for (let i = 0; i < 4; i++) {
            if (currX + nx[i] < 0 || currX + nx[i] >= sizeX || currY + ny[i] < 0 || currY + ny[i] >= sizeY || map[currY + ny[i]][currX + nx[i]].passage === false) {
                continue;
            }
            var temp = {}
            temp.h = heuristic(currY + ny[i], currX + nx[i]);
            temp.g = map[currY][currX].g + 1;
            temp.f = temp.h + temp.g;
            temp.aStarParent = map[currY][currX];

            if (map[currY + ny[i]][currX + nx[i]].aStarVisited) {
                if (map[currY + ny[i]][currX + nx[i]].f > temp.f) {
                    map[currY + ny[i]][currX + nx[i]].f = temp.f;
                    map[currY + ny[i]][currX + nx[i]].h = temp.h
                    map[currY + ny[i]][currX + nx[i]].g = temp.g;
                    map[currY + ny[i]][currX + nx[i]].aStarParent = map[currY][currX];
                }
            }
            else {
                map[currY + ny[i]][currX + nx[i]].f = temp.f;
                map[currY + ny[i]][currX + nx[i]].h = temp.h
                map[currY + ny[i]][currX + nx[i]].g = temp.g;
                map[currY + ny[i]][currX + nx[i]].aStarParent = map[currY][currX];
                queue.push(map[currY + ny[i]][currX + nx[i]])
            }
        }
    }
    backtrack();
}

async function backtrack() {
    var path = [];
    var currTile = map[endPosY][endPosX].aStarParent;
    console.log(currTile);
    isCleared = false;
    while (currTile.aStarParent != null) {
        currX = currTile.x;
        currY = currTile.y;
        var id = currY + "_" + currX;
        path.push(id);
        currTile = currTile.aStarParent;
    }

    path.reverse();

    for (let i = 0; i < path.length; i++) {
        if (isCleared) {
            console.log("object")
            clearMaze();
            convertToButton();
            return;
        }
        document.getElementById(path[i]).className = "passage tile path"
        isRunning = true;
        await sleep(50);
    }
    isRunning = false;
}

function reset() {
    document.getElementById("maze-container").innerHTML = "";
    startPosX = -1;
    startPosY = -1;
    endPosX = -1;
    endPosY = -1;
    init();
}


function init() {
    map = initArray();
    initMap();
    prim();
    document.getElementById("maze-container").innerHTML = "";
    document.getElementById("maze-container").style.height = sizeY * 20;
}

function clearMaze() {
    for (let i = 0; i < sizeY; i++) {
        for (let j = 0; j < sizeX; j++) {
            if (map[i][j].passage) {
                map[i][j].f = map[i][j].g = map[i][j].h = 0;
                map[i][j].aStarVisited = false;
                map[i][j].aStarParent = null;
            }
        }
    }
}

function newMap() {

    if (isRunning == false) {
        let height = document.getElementById("heightMaze").value
        let width = document.getElementById("widthMaze").value
        if (height % 2 == 0 || width % 2 == 0) {
            document.getElementById("errorMessage").innerHTML = "Sorry, height or width must be an odd number"
        }
        else {
            sizeY = height;
            sizeX = width;
            init();
        }
    }
}

init();