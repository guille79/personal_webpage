
        var canvas, ctx, width, height;
        var ballArray = [];
        var pivotArray = [];
        var delta, oldTime = 0;
        var timeBetweenBalls = 200;
        var currentTime;
        var bucketNumber = 19;
        var bucketWidth;
        var bucketHeight = []
        
        function init() {
          canvas = document.querySelector("#myCanvas");
          ctx = canvas.getContext('2d');
          width = canvas.width;
          height = canvas.height;
          currentTime = timeBetweenBalls;
          // Change this number to get more balls
          //createBalls(500);
          createPivots(5, 21);
          bucketWidth = width/bucketNumber;
          for (var i = 0; i < bucketNumber; i++) {
            bucketHeight[i] = 0.0;
          }
          requestAnimationFrame(mainLoop);
        }
        
        function createBalls(numberOfBalls) {
          for(var i=0; i < numberOfBalls; i++) {        
            // Create a ball with random position and speed
            var ball =  new Ball(width*(0.45+0.1*Math.random()), 0,
                                  0, 0, 10); // radius, change if ou like.
            // Add it to the array
            //ballArray[i] = ball;
            ballArray.push(ball);
          }
        }                                
        
        function addBall() {
            createBalls(1);
            requestAnimationFrame(mainLoop);
        }
        
        function createPivots(pivotRows, pivotCols) {
          const dx = width/(pivotCols+1);
          for(var i=0; i < pivotRows; i++) {
            for(var j=0; j < pivotCols; j++) {
                // Create a pivot with fixed position 
                var pivot1 =  new Pivot(dx*(j+1),
                                  (i*dx+height*0.3), 5); // radius, change if ou like.
                var pivot2 =  new Pivot(dx*(j+0.5),
                                  ((i+0.5)*dx+height*0.3), 5); // radius, change if ou like.
                // Add it to the array
                pivotArray.push(pivot1);
                pivotArray.push(pivot2);
            }
          }
        }
        
        function timer(currentTime) {
            var delta = currentTime - oldTime;
            oldTime = currentTime;
            return delta;
        }
        
        var mainLoop = function(time) {
            // number of ms since last frame draw
            delta = timer(time);
            
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // uncomment for blur effect, comment previous line
            //ctx.fillStyle = "rgba(0, 240, 240, 0.2)";
            //ctx.fillRect (0, 0, width, height);
            //ctx.fillStyle='black';
            
            // For each pivot in the array
            for(var i=0; i < pivotArray.length; i++) {
              var pivote = pivotArray[i];        
              // draw the pivot
              pivote.draw();
            }
            
            // For each ball in the array
            for(var i=0; i < ballArray.length; i++) {
              var balle = ballArray[i];
              // 1) Move the ball
              balle.move();             
              // 2) collision test with walls
              collisionTestWithWalls(balle);        
              // 3) draw the ball
              balle.draw();
            }
                      
            drawBuckets();
            collisionTestBallsAndPivots();
            collisionTestBetweenBalls();
            gravity(delta);
            
            currentTime -= delta;
            if (currentTime < 0) {
                currentTime = timeBetweenBalls;
                addBall();
            } 
            else {
                // Ask for new animation frame
                window.requestAnimationFrame(mainLoop);
            }            
        }
         
        function drawBuckets() { // to represent the balls that already touched the floor
            for (var i = 0; i < bucketNumber; i++) {
                ctx.fillRect((i*bucketWidth), (height-bucketHeight[i]), bucketWidth, bucketHeight[i]);
            }
        }
        
        function collisionTestWithWalls(ball) {
            if (ball.x < ball.rayon) {
                // deletes the balls that go outside the canvas
                ballArray.splice(ballArray.indexOf(ball), 1);
            //    ball.x = ball.rayon;
            //    ball.vx *= -1;
            } 
            if (ball.x > width - (ball.rayon)) {
                ballArray.splice(ballArray.indexOf(ball), 1);
            //    ball.x = width - (ball.rayon);
            //    ball.vx *= -1;
            }     
            if (ball.y < ball.rayon) {
                ball.y = ball.rayon;
                ball.vy *= -1;
            }     
            if (ball.y > height - (ball.rayon)) {
                ball.y = height - (ball.rayon);
                //ball.vy *= -1;
                // trasfers the area of the ball to rectangular buckets
                var bucket = Math.floor(ball.x / bucketWidth);
                bucketHeight[bucket] += Math.PI*(ball.rayon**2)/bucketWidth;
                ballArray.splice(ballArray.indexOf(ball), 1);
            }
        }
                  
        function collisionTestBetweenBalls() {  
          var balls = ballArray;
          for (var i = 0; i < ballArray.length; i++) {
                for (var j = i + 1; j < ballArray.length; j++) {
                    var dx = balls[j].x - balls[i].x;
                    var dy = balls[j].y - balls[i].y;
                  
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < (balls[j].rayon + balls[i].rayon)) {
                        // balls have contact so push back...
                        var normalX = dx / dist;
                        var normalY = dy / dist;
                        var middleX = (balls[i].x + balls[j].x) / 2;
                        var middleY = (balls[i].y + balls[j].y) / 2;
                          
                        balls[i].x = middleX - normalX * balls[i].rayon;
                        balls[i].y = middleY - normalY * balls[i].rayon;
                        balls[j].x = middleX + normalX * balls[j].rayon;
                        balls[j].y = middleY + normalY * balls[j].rayon;
                      
                        var dVector = (balls[i].vx - balls[j].vx) * normalX;
                        dVector += (balls[i].vy - balls[j].vy) * normalY;
                        var dvx = dVector * normalX;
                        var dvy = dVector * normalY;
                                              
                        balls[i].vx -= dvx;
                        balls[i].vy -= dvy;
                        balls[j].vx += dvx;
                        balls[j].vy += dvy;
                    }
                }
            }
        }
        
        function collisionTestBallsAndPivots() {  
          var balls = ballArray;
          var pivots = pivotArray; 
          for (var j = 0; j < pivotArray.length; j++) {
                for (var i = 0; i < ballArray.length; i++) {
                    let x = balls[i].x - pivots[j].x;
                    let y = balls[i].y - pivots[j].y;
                    let radialDistance = Math.sqrt(x**2+y**2);
                    if (radialDistance < pivots[j].rayon + balls[i].rayon) {
                        // correct ball's position
                        x *= (pivots[j].rayon + balls[i].rayon)/radialDistance;
                        y *= (pivots[j].rayon + balls[i].rayon)/radialDistance;
                        radialDistance = pivots[j].rayon + balls[i].rayon;
                        balls[i].x = x + pivots[j].x;
                        balls[i].y = y + pivots[j].y;
                        // modify ball's velocity
                        let vx = balls[i].vx;
                        let vy = balls[i].vy;
                        let vn = (x*vx+y*vy)/radialDistance;
                        let vt = (-y*vx+x*vy)/radialDistance;
                        vn *= -0.5;
                        balls[i].vx = (x*vn-y*vt)/radialDistance;
                        balls[i].vy = (y*vn+x*vt)/radialDistance;    
                    }
                }
            }
        }
        
        function gravity(delta) {
            var balls = ballArray;
            for (var i = 0; i < ballArray.length; i++) {
                balls[i].vy += 98*delta/1000;
            }         
        }
        
        function Ball(x, y, vx, vy, diameter) {
          this.x = x;
          this.y = y;
          this.vx = vx;
          this.vy = vy;
          this.rayon = diameter/2;
          
          this.draw = function() {
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.rayon, 0, 2*Math.PI);
              ctx.fill();
          };
          
          this.move = function() {
            this.x += this.vx*delta/1000;
            this.y += this.vy*delta/1000; 
          };
        }
        
        function Pivot(x, y, diameter) {
          this.x = x;
          this.y = y;
          this.rayon = diameter/2;
          
          this.draw = function() {
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.rayon, 0, 2*Math.PI);
              ctx.fill();
          };
        }  
