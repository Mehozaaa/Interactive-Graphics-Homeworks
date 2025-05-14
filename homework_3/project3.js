// project3.js
// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
    const cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);

    // Rotation about X-axis
    const rotXMat = [
        1,    0,     0,    0,
        0,  cosX, -sinX,  0,
        0,  sinX,  cosX,  0,
        0,    0,     0,   1
    ];

    const rotYMat = [
        cosY,  0, sinY,  0,
          0,   1,   0,   0,
       -sinY,  0, cosY,  0,
          0,   0,   0,   1
    ];

    const transMat = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];

    const modelMat = MatrixMult(transMat, MatrixMult(rotYMat, rotXMat));
    return MatrixMult(projectionMatrix, modelMat);
}
// MeshDrawer: encapsulates everything needed to render a textured triangular mesh.
class MeshDrawer {
    // The constructor is a good place for taking care of the necessary initializations.
    constructor() {
        const vertSrc = `
            attribute vec3 pos;
            attribute vec2 texCoord;
            uniform mat4 mvp;
            uniform bool swapYZ;
            varying vec2 vTexCoord;
            void main() {
                vec3 position = pos;
                if (swapYZ) {
                    position = vec3(position.x, position.z, position.y);
                }
                gl_Position = mvp * vec4(position, 1.0);
                vTexCoord = texCoord;
            }
        `;
        const fragSrc = `
            precision mediump float;
            uniform bool showTexture;
            uniform sampler2D texSampler;
            varying vec2 vTexCoord;
            void main() {
                if (showTexture) {
                    gl_FragColor = texture2D(texSampler, vTexCoord);
                } else {
                    float d = gl_FragCoord.z;
                    gl_FragColor = vec4(1.0, d*d, 0.0, 1.0);
                }
            }
        `;
        this.prog = InitShaderProgram(vertSrc, fragSrc);
        this.posLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texLoc = gl.getAttribLocation(this.prog, 'texCoord');
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.swapLoc = gl.getUniformLocation(this.prog, 'swapYZ');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTexture');
        this.samplerLoc = gl.getUniformLocation(this.prog, 'texSampler');
        this.posBuffer = gl.createBuffer();
        this.texBuffer = gl.createBuffer();
        this.texture = gl.createTexture();
        this.swapFlag        = false;
        this.isTextureShown  = false;
        this.numVertices     = 0;

        gl.useProgram(this.prog);
        gl.uniform1i(this.samplerLoc, 0);      
        gl.uniform1i(this.swapLoc, 0);          
    }
    // This method is called every time the user opens an OBJ file.

    setMesh(vertPos, texCoords) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        this.numVertices = vertPos.length / 3;
    }
   // This method is called when the user changes the state of the
    swapYZ(swap) {
        this.swapFlag = swap;
        gl.useProgram(this.prog);
        gl.uniform1i(this.swapLoc, swap ? 1 : 0);
    }
    // This method is called to draw the triangular mesh.
    draw(mvpMatrix) {
        gl.useProgram(this.prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.enableVertexAttribArray(this.posLoc);
        gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.enableVertexAttribArray(this.texLoc);
        gl.vertexAttribPointer(this.texLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(this.mvpLoc, false, mvpMatrix);
        gl.uniform1i(this.swapLoc, this.swapFlag ? 1 : 0);
        gl.uniform1i(this.showTexLoc, this.isTextureShown ? 1 : 0);

        if (this.isTextureShown) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }

        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
    // This method is called to set the texture of the mesh.
    setTexture(img) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
            gl.TEXTURE_2D, 0,
            gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            img
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

   // This method is called when the user changes the state of the "Show Texture" checkbox. 
    showTexture(show) {
        this.isTextureShown = show;
        gl.useProgram(this.prog);
        gl.uniform1i(this.showTexLoc, show ? 1 : 0);
    }
}
