//Please find the project breakdown under README file

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation firotsct applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.

function GetTransform(positionX, positionY, rotationDeg, scale) {
    
    var theta = rotationDeg * Math.PI / 180;

    var SM = [
        scale,    0,      0,
        0,     scale,     0,
        0,        0,      1
    ];
    
    var c = Math.cos(theta), s = Math.sin(theta);
    var RM = [
         c,   s,   0,
        -s,   c,   0,
         0,   0,   1
    ];
    
    var TM = [
        1,  0,  0,
        0,  1,  0,
        positionX, positionY, 1
    ];

    var RotSc = new Array(9);
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            var sum = 0;
            for (var k = 0; k < 3; k++) {

                sum += RM[k*3 + row] * SM[col*3 + k];
            }

            RotSc[col*3 + row] = sum;
        }
    }

    var FM = new Array(9);
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            var sum = 0;
            for (var k = 0; k < 3; k++) {
                sum += TM[k*3 + row] * RotSc[col*3 + k];
            }
            FM[col*3 + row] = sum;
        }
    }
    return FM;
}


// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation firotsct applies trans1 and then trans2.

function ApplyTransform(trans1, trans2) {
    var C = new Array(9);
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            var sum = 0;
            for (var k = 0; k < 3; k++) {
                sum += trans2[k*3 + row] * trans1[col*3 + k];
            }
            C[col*3 + row] = sum;
        }
    }
    return C;
}
