(function() {
  var myApp;

  myApp = angular.module('gameApp', []);

  myApp.controller('GameController', [
    '$scope', function($scope) {
      var Player, applyDeadzone, canvas, canvasHeight, context, draw, gameloop, gamepads, getControl, keys, listening, players, setCanvasDimensions, update, world;
      $scope.deletePlayer = function(id) {
        return delete players[id];
      };
      keys = {};
      canvasHeight = 150;
      $scope.addKeyboardBlock = function() {
        var id, timestamp;
        timestamp = new Date().getTime();
        id = 'Keyboard_' + timestamp;
        return players[id] != null ? players[id] : players[id] = new Player(id);
      };
      listening = null;
      $scope.listeningForInput = function(event, id, control) {
        var button;
        event.target.value = "Listening";
        return listening = {
          target: event.target,
          id: id,
          control: control,
          storedKeys: players[id].keyboard ? JSON.parse(JSON.stringify(keys)) : [],
          storedButtons: (function() {
            var i, len, ref, results;
            if (!players[id].keyboard) {
              ref = gamepads[id].buttons;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                button = ref[i];
                results.push(button.value);
              }
              return results;
            } else {
              return [];
            }
          })(),
          storedAxes: !players[id].keyboard ? gamepads[id].axes.slice(0) : []
        };
      };
      $scope.populateWithCurrentControls = function(id, control) {
        var player;
        player = players[id];
        if (player.controls[control].arrayName != null) {
          return player.controls[control].arrayName + '[' + player.controls[control].arrayIndex + ']';
        } else {
          return player.controls[control];
        }
      };
      $scope.repopulateWithCurrentInput = function(event, id, control) {
        event.target.value = $scope.populateWithCurrentControls(id, control);
        return listening = null;
      };
      canvas = document.getElementById("canvas");
      context = canvas.getContext("2d");
      canvas.height = canvasHeight;
      setCanvasDimensions = function() {
        canvas.width = window.innerWidth;
        return context.fillStyle = "#c55d22";
      };
      setCanvasDimensions();
      world = {
        gravity: 0.5,
        floorFriction: 0.2
      };
      gamepads = {};
      players = {};
      Player = function(id) {
        var h, keyboard, w;
        w = 15;
        h = 30;
        keyboard = id.indexOf('Keyboard_') > -1;
        return {
          id: id,
          x: typeof x !== "undefined" && x !== null ? x : (canvas.width / 2) - (w / 2),
          y: typeof y !== "undefined" && y !== null ? y : (canvas.height / 2) - (h / 2),
          w: w,
          h: h,
          jumpForce: 10,
          maxSpeed: {
            x: 10
          },
          maxSpeedUsingJoystick: {
            x: 10
          },
          speed: {
            x: 0.5
          },
          velocity: {
            x: 0,
            y: 0
          },
          keyboard: keyboard,
          controls: (function() {
            if (!keyboard) {
              return {
                left: {
                  arrayName: 'axes',
                  arrayIndex: 0,
                  min: 0,
                  max: -1
                },
                jump: {
                  arrayName: 'buttons',
                  arrayIndex: 11,
                  min: 0,
                  max: 0.5
                },
                right: {
                  arrayName: 'axes',
                  arrayIndex: 0,
                  min: 0,
                  max: 1
                }
              };
            } else {
              return {
                left: 37,
                jump: 38,
                right: 39
              };
            }
          })(),
          releasedJumpButton: true,
          canJump: false,
          update: function() {
            var floored, joystickX, jump, left, newNumber, positive, ref, right;
            left = getControl(id, 'left');
            right = getControl(id, 'right');
            jump = getControl(id, 'jump');
            joystickX = applyDeadzone(right - left, 0.25);
            floored = this.canJump && this.velocity.y === 0;
            if (floored) {
              this.velocity.x += joystickX * this.speed.x;
              this.maxSpeedUsingJoystick.x = Math.abs(joystickX) * this.maxSpeed.x;
            }
            this.jumpButtonDown = jump > 0.5;
            if (this.velocity.y === 0 && this.jumpButtonDown && this.canJump && this.releasedJumpButton) {
              this.velocity.y = -this.jumpForce;
              this.canJump = false;
            }
            if (this.velocity.x > this.maxSpeedUsingJoystick.x) {
              this.velocity.x -= this.speed.x;
            }
            if (this.velocity.x < -this.maxSpeedUsingJoystick.x) {
              this.velocity.x += this.speed.x;
            }
            if ((-this.speed.x < (ref = this.velocity.x) && ref < this.speed.x)) {
              positive = this.velocity.x > 0;
              newNumber = Math.abs(this.velocity.x) - (floored ? world.floorFriction : 0);
              if (newNumber < 0) {
                newNumber = 0;
              }
              this.velocity.x = (positive ? 1 : -1) * newNumber;
            }
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            if (this.y < canvas.height - this.h) {
              this.velocity.y += world.gravity;
            }
            if (this.y > canvas.height - this.h) {
              this.y = canvas.height - this.h;
              this.velocity.y = 0;
            }
            if (this.y === canvas.height - this.h) {
              this.canJump = true;
            }
            if (!this.releasedJumpButton && !this.jumpButtonDown) {
              this.releasedJumpButton = true;
            }
            this.releasedJumpButton = !this.jumpButtonDown;
            if (this.x > canvas.width) {
              this.x = -this.w;
            }
            if (this.x < -this.w) {
              return this.x = canvas.width;
            }
          }
        };
      };
      getControl = function(id, control) {
        var controlValue, gamepad, player;
        player = players[id];
        if (!player.keyboard) {
          gamepad = gamepads[id];
          controlValue = gamepad[player.controls[control].arrayName][player.controls[control].arrayIndex];
          if (controlValue != null) {
            if (controlValue.value != null) {
              controlValue = controlValue.value;
            }
            if (player.controls[control].min < player.controls[control].max) {
              if ((player.controls[control].min <= controlValue && controlValue <= player.controls[control].max)) {
                controlValue = (controlValue - player.controls[control].min) / (player.controls[control].max - player.controls[control].min);
              } else if (controlValue > player.controls[control].max) {
                controlValue = 1;
              } else {
                controlValue = 0;
              }
            } else {
              if ((player.controls[control].max <= controlValue && controlValue <= player.controls[control].min)) {
                controlValue = (controlValue - player.controls[control].min) / (player.controls[control].max - player.controls[control].min);
              } else if (controlValue < player.controls[control].max) {
                controlValue = 1;
              } else {
                controlValue = 0;
              }
            }
          }
          return controlValue;
        } else {
          if (keys[player.controls[control]] != null) {
            return 1;
          } else {
            return 0;
          }
        }
      };
      applyDeadzone = function(number, threshold) {
        var percentage;
        percentage = (Math.abs(number) - threshold) / (1 - threshold);
        if (percentage < 0) {
          percentage = 0;
        }
        return percentage * (number > 0 ? 1 : -1);
      };
      update = function() {
        var axis, axisIndex, button, buttonFound, buttonIndex, difference, flattenedKeys, gamepad, gamepadId, i, id, j, k, len, len1, len2, ref, ref1, ref2, results;
        $scope.$apply(function() {
          return $scope.players = players;
        });
        if (Object.keys(players).length > 0) {
          if ($scope.playersPresent == null) {
            $scope.playersPresent = true;
          }
        }
        gamepads = {};
        ref = navigator.getGamepads();
        for (i = 0, len = ref.length; i < len; i++) {
          gamepad = ref[i];
          if (gamepad != null) {
            gamepads[gamepad.id] = gamepad;
          }
        }
        for (id in players) {
          if (!players[id].keyboard) {
            if (gamepads[id] == null) {
              delete players[id];
            } else {
              gamepad = gamepads[id];
              if ((listening != null) && listening.id === id) {
                buttonFound = false;
                ref1 = listening.storedButtons;
                for (buttonIndex = j = 0, len1 = ref1.length; j < len1; buttonIndex = ++j) {
                  button = ref1[buttonIndex];
                  difference = gamepad.buttons[buttonIndex].value - button;
                  if (Math.abs(difference) > 0.5) {
                    players[listening.id].controls[listening.control].min = Math.round(button) / 2;
                    players[listening.id].controls[listening.control].max = Math.round(gamepad.buttons[buttonIndex].value) / 2;
                    players[listening.id].controls[listening.control].arrayName = 'buttons';
                    players[listening.id].controls[listening.control].arrayIndex = buttonIndex;
                    listening.target.blur();
                    buttonFound = true;
                    break;
                  }
                }
                if (!buttonFound) {
                  ref2 = listening.storedAxes;
                  for (axisIndex = k = 0, len2 = ref2.length; k < len2; axisIndex = ++k) {
                    axis = ref2[axisIndex];
                    difference = gamepad.axes[axisIndex] - axis;
                    if (Math.abs(difference) > 0.5) {
                      players[listening.id].controls[listening.control].min = Math.round(axis);
                      players[listening.id].controls[listening.control].max = Math.round(gamepad.axes[axisIndex]);
                      players[listening.id].controls[listening.control].arrayName = 'axes';
                      players[listening.id].controls[listening.control].arrayIndex = axisIndex;
                      listening.target.blur();
                      break;
                    }
                  }
                }
              }
            }
          } else {
            if ((listening != null) && listening.id === id) {
              flattenedKeys = Object.keys(keys);
              if (flattenedKeys.length === 1) {
                players[id].controls[listening.control] = parseInt(flattenedKeys[0]);
                listening.target.blur();
              }
            }
            players[id].update();
          }
        }
        results = [];
        for (gamepadId in gamepads) {
          if (players[gamepadId] == null) {
            players[gamepadId] = new Player(gamepadId);
          }
          results.push(players[gamepadId].update());
        }
        return results;
      };
      draw = function() {
        var id, player, results;
        context.clearRect(0, 0, canvas.width, canvas.height);
        results = [];
        for (id in players) {
          player = players[id];
          results.push(context.fillRect(player.x, player.y, player.w, player.h));
        }
        return results;
      };
      gameloop = function() {
        update();
        draw();
        return window.requestAnimationFrame(gameloop);
      };
      gameloop();
      window.onresize = function() {
        return setCanvasDimensions();
      };
      window.onkeydown = function(e) {
        e = e || window.event;
        return keys[e.keyCode] = true;
      };
      return window.onkeyup = function(e) {
        e = e || window.event;
        return delete keys[e.keyCode];
      };
    }
  ]).directive('controlSettings', function() {
    return {
      templateUrl: 'control-settings.html'
    };
  });

}).call(this);
