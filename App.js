/// <reference path='./libs/pixi.js.d.ts'/>
var Main;
(function (Main) {
    var App = /** @class */ (function () {
        function App() {
        }
        App.reset = function () {
            //animation parameters
            this.speed = .01;
            this.mainCounterIncrement = 0.001;
            this.rippleCounterIncrement = -0.025;
            this.rippleThicknessMax = 50;
            this.rippleWaveDensity = 0.05;
            this.rippleThicknessPhaseOut = 0.9;
            this.fracBase = 0;
            this.fracBaseInc = .0005;
            this.fracMod = 1;
            this.colorInc = 0.1;
            this.xmod1 = 1;
            this.xmod2 = 1;
            this.ymod1 = 1;
            this.ymod2 = 1;
            this.c = 0;
            this.r = 0;
            this.smc = 0;
            this.main = 0;
            //init rings again
            this.rings = [];
            var rings = this.rings;
            for (var i = 1; i <= this.SpokeResolution; i++) {
                var factor = i / this.SpokeResolution;
                var ring = [];
                rings.push(ring);
                ring.push(1); // thickness
                ring.push(this.Alpha); // alpha
                ring.push((this.height * 0.33) * factor); // radius
                ring.push(0); // rotation
            }
            //this time we randomize the modulator start points, for variance each reset
            this.modulators = [];
            this.addModulator("rippleThicknessMax", 5, 75, 0.00075, Math.random()); //1
            this.addModulator("rippleThicknessPhaseOut", 0.05, 1, 0.00175, Math.random()); //0
            this.addModulator("rippleWaveDensity", 0.01, 0.5, 0.001, Math.random()); //0
            this.addModulator("rippleCounterIncrement", -0.05, 0.05, 0.0005, Math.random()); //.5
            this.addModulator("mainCounterIncrement", 0.001, 0.01, 0.00125, Math.random()); //.1
            this.addModulator("xmod1", 0.99, 1.01, 0.0001, .5);
            this.addModulator("xmod2", 0.99, 1.01, 0.00005, .5);
            this.addModulator("ymod1", 0.99, 1.01, 0.0002, .5);
            this.addModulator("ymod2", 0.99, 1.01, 0.00015, .5);
            this.addModulator("fracBase", 1, -1, 0.0025, Math.random());
            this.addModulator("fracMod", 1, 4, 0.0005, Math.random());
            this.addModulator("colorInc", -.15, .15, 0.0002, Math.random());
        };
        App.init = function () {
            var _this = this;
            //basics
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            //pixi config
            var appConfig = {
                width: this.width,
                height: this.height,
                resolution: 1,
                backgroundColor: this.BackgroundColor,
                antialias: true
            };
            this.pixiApp = new PIXI.Application(appConfig);
            this.pixiApp.ticker.add(function (delta) { return _this.update(delta); });
            this.stage = Main.App.pixiApp.stage;
            this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
            //init gfx
            this.gfx = new PIXI.Graphics();
            this.stage.addChild(this.gfx);
            //logo
            if (this.ShowLogo) {
                this.logo = PIXI.Sprite.fromImage("logo.png");
                this.logo.anchor.x = this.logo.width / 2;
                this.logo.anchor.y = this.logo.height / 2;
                this.logo.scale.x = this.width / 2500;
                this.logo.scale.y = this.logo.scale.x;
                this.logo.x = this.width / 2;
                this.logo.y = this.height / 2;
                this.stage.addChild(this.logo);
            }
            //init rings
            var rings = this.rings;
            for (var i = 1; i <= this.SpokeResolution; i++) {
                var factor = i / this.SpokeResolution;
                var ring = [];
                rings.push(ring);
                ring.push(1); // thickness
                ring.push(this.Alpha); // alpha
                ring.push((this.height * 0.33) * factor); // radius
                ring.push(0); // rotation
            }
            //init modulator
            this.addModulator("rippleThicknessMax", 5, 75, 0.00075, 1); //1
            this.addModulator("rippleThicknessPhaseOut", 0.05, 1, 0.00175, 0); //0
            this.addModulator("rippleWaveDensity", 0.01, 0.5, 0.001, 0); //0
            this.addModulator("rippleCounterIncrement", -0.05, 0.05, 0.0005, .5); //.5
            this.addModulator("mainCounterIncrement", 0.001, 0.01, 0.00125, .1); //.1
            this.addModulator("xmod1", 0.99, 1.01, 0.0001, .5);
            this.addModulator("xmod2", 0.99, 1.01, 0.00005, .5);
            this.addModulator("ymod1", 0.99, 1.01, 0.0002, .5);
            this.addModulator("ymod2", 0.99, 1.01, 0.00015, .5);
            this.addModulator("fracBase", 1, -1, 0.0025, .5);
            this.addModulator("fracMod", 1, 4, 0.0005, 0);
            //this.addModulator ("fracBaseInc",0.001,0.002,0.005,0);
            this.addModulator("colorInc", -.15, .15, 0.0002, 0);
            //initial resize
            Main.App.resize();
        };
        //add a modulator to a variable - will osciallate between min and max values at given speed
        //start == 0-1 (min -> max)
        App.addModulator = function (pName, min, max, speed, start) {
            var newMod = [];
            newMod.push(pName);
            newMod.push(min);
            newMod.push(max);
            newMod.push(speed);
            newMod.push(this.translate(start, 0, 1, Math.PI, Math.PI * 2));
            this.modulators.push(newMod);
        };
        //main loop
        App.update = function (delta) {
            //global reset
            this.main++;
            var alphaMod = 1;
            if (this.main < 100) {
                alphaMod = this.main / 100;
            }
            if (this.main >= this.ResetAfter) {
                this.reset();
                return;
            }
            //init gfx
            var gfx = this.gfx;
            gfx.clear();
            gfx.position.set(this.width / 2, this.height / 2);
            //modulate variables
            this.smc += 0.0001;
            for (var i = 0; i < this.modulators.length; i++) {
                var mod = this.modulators[i];
                var value = mod[4];
                var speedMod = Math.cos(this.smc) + 1;
                var speed = mod[3] * speedMod;
                var max = mod[2];
                var min = mod[1];
                var param = mod[0];
                value += speed;
                this[param] = min + (Math.cos(value) * (max - min));
                this[param] = this.translate(Math.cos(value), -1, 1, min, max);
                mod[4] = value;
            }
            //change rings over time
            this.c += this.mainCounterIncrement;
            this.r += this.rippleCounterIncrement;
            //var rr = this.r%this.RingsTotal;
            var totalFactor = Math.cos(this.c * 0.001);
            var rings = this.rings;
            for (var i = 0; i < this.SpokeResolution; i++) {
                var ring = rings[i];
                var ringFactor = (i / this.SpokeResolution); // 1-(i/this.RingsTotal);
                // thickness
                ring[0] = 1 + (this.rippleThicknessMax * this.rippleThicknessPhaseOut) + (Math.cos(this.r + (i * this.rippleWaveDensity)) * this.rippleThicknessMax);
                // alpha
                //ring[1]=((Math.cos(this.r*0.25+(i*this.rippleWaveDensity)))*.25)+0.25;
                // radius
                ring[2] += Math.cos(this.c) * (0.75 - ringFactor) * 0.5; //1-ringFactor
                // rotation
                //var modmod = Math.cos(this.c);
                //ring[3]+=Math.cos(this.c)*this.speed*ringFactor*(ringFactor/totalFactor)*Math.sin((modmod*Math.cos(this.c))-totalFactor);//Math.cos(this.c/this.r)- // r or c alone are also interesting. C gets stuck in the O ZONE
                ring[3] += Math.cos(this.c) * this.speed * ringFactor * (ringFactor / totalFactor) * Math.sin(totalFactor);
            }
            //draw
            var frac = this.fracBase;
            var clr = 0xb30175;
            for (var i = 0; i < this.SpokeResolution; i++) {
                var ring = rings[i];
                var nextRing = i == this.SpokeResolution ? null : rings[i + 1];
                if (nextRing) {
                    var thickness = ring[0];
                    var alpha = ring[1];
                    var radius1 = ring[2];
                    var rotation1 = ring[3];
                    var radius2 = nextRing[2];
                    var rotation2 = nextRing[3];
                    for (var j = 0; j < this.SpokeTotal; j++) {
                        if (this.UseColor)
                            clr += this.colorInc;
                        frac -= this.fracBaseInc;
                        var angle1 = (j / this.SpokeTotal) * Math.PI * 2 + rotation1;
                        var angle2 = (j / this.SpokeTotal) * Math.PI * 2 + rotation2;
                        var ring1X = (Math.cos(angle1) * radius1) * this.xmod1;
                        var ring1Y = (Math.sin(angle1) * radius1) * this.ymod1;
                        var ring2X = (Math.cos(angle2) * radius2) * this.xmod2;
                        var ring2Y = (Math.sin(angle2) * radius2) * this.ymod2;
                        //interpolate final line position
                        ring2X = ring1X + (ring2X - ring1X) * frac * this.fracMod;
                        ring2Y = ring1Y + (ring2Y - ring1Y) * frac * this.fracMod;
                        this.gfx.lineStyle(thickness, clr, alpha * alphaMod)
                            .moveTo(ring1X, ring1Y)
                            .lineTo(ring2X, ring2Y);
                    }
                }
            }
            //render
            this.renderer.render(this.stage);
        };
        App.resize = function () {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            if (this.ShowLogo) {
                this.logo.scale.x = this.width / 2500;
                this.logo.scale.y = this.logo.scale.x;
                this.logo.x = this.width / 2;
                this.logo.y = this.height / 2;
            }
        };
        App.translate = function (num, min1, max1, min2, max2) {
            return ((num - min1) / (max1 - min1) * (max2 - min2)) + min2;
        };
        //Global Constants
        App.BackgroundColor = 0x222222; // main BG color
        App.UseColor = true; // false for "Artifact magenta only"
        App.ShowLogo = true; // false to hide Artifact logo
        App.SpokeTotal = 12; //number of "spokes" - suggested 12
        App.SpokeResolution = 200; //spoke resolution - suggested 200
        App.Alpha = 0.33; //suggested 0.33-0.5
        App.ResetAfter = 30000; //number of frame ticks to reset the animation after
        App.width = 0;
        App.height = 0;
        //rings
        App.rings = [];
        //animation counters
        App.c = 0;
        App.r = 0;
        App.smc = 0;
        App.main = 0;
        //animation parameters
        App.speed = .01; // overall speed and intensity ||| suggested 0.01, .001 and .1 are also interesting
        App.mainCounterIncrement = 0.001; //extremity of effect ||| suggested 0.001 (0.1 is interesting also)
        App.rippleCounterIncrement = -0.025; // how fast the ripples appear |||| suggested -0.25   - positive=inward
        App.rippleThicknessMax = 50; //how fat the thickness ripples get ||| suggested 10 although 50-100 is interesting
        App.rippleWaveDensity = 0.05; // how many waves per spoke 0.01 = 1 wave,  1= tons of waves ||| suggested 0.05
        App.rippleThicknessPhaseOut = 0.9; // 1=no phase out, 0=max pahse out(no gfx) ||| suggested 0.9
        App.fracBase = 0;
        App.fracBaseInc = .0005;
        App.fracMod = 1;
        App.colorInc = 0.1;
        //drawing mods
        App.xmod1 = 1;
        App.xmod2 = 1;
        App.ymod1 = 1;
        App.ymod2 = 1;
        App.modulators = [];
        return App;
    }());
    Main.App = App;
})(Main || (Main = {}));
window.onload = function () {
    Main.App.init();
    document.body.appendChild(Main.App.pixiApp.view);
};
window.onresize = function () {
    Main.App.resize();
};
//# sourceMappingURL=App.js.map