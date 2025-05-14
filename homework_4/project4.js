// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
function GetModelViewMatrix( tx, ty, tz, rotX, rotY ) {
    const cx = Math.cos(rotX), sx = Math.sin(rotX);
    const cy = Math.cos(rotY), sy = Math.sin(rotY);

    const rotXMat = [
      1, 0,  0, 0,
      0, cx, sx, 0,
      0, -sx, cx, 0,
      0, 0,  0, 1
    ];
    const rotYMat = [
      cy, 0, -sy, 0,
       0, 1,   0, 0,
      sy, 0,  cy, 0,
       0, 0,   0, 1
    ];
    const trans = [
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      tx,ty,tz,1
    ];
    return MatrixMult( trans, MatrixMult(rotYMat, rotXMat) );
}

// MeshDrawer class implementing Blinn-Phong shading
class MeshDrawer {
    // The constructor is a good place for taking care of the necessary initializations.
    constructor() {
        const vsSource = `
            attribute vec3 pos;
            attribute vec2 texCoord;
            attribute vec3 normal;
            uniform mat4 mvp;
            uniform mat4 mv;
            uniform mat3 normalMatrix;
            uniform bool swapYZ;
            varying vec2 vTexCoord;
            varying vec3 vNormal;
            varying vec3 vPos;
            void main() {
                vec3 p = pos;
                vec3 n = normal;
                if (swapYZ) {
                    p = vec3(pos.x, pos.z, pos.y);
                    n = vec3(normal.x, normal.z, normal.y);
                }
                vPos = vec3(mv * vec4(p, 1.0));
                vNormal = normalize(normalMatrix * n);
                vTexCoord = texCoord;
                gl_Position = mvp * vec4(p, 1.0);
            }
        `;

        const fsSource = `
            precision mediump float;
            varying vec2 vTexCoord;
            varying vec3 vNormal;
            varying vec3 vPos;
            uniform bool showTexture;
            uniform sampler2D texSampler;
            uniform vec3 lightDir;
            uniform float shininess;
            void main() {
                vec3 N = normalize(vNormal);
                vec3 L = normalize(lightDir);
                vec3 V = normalize(-vPos);
                vec3 H = normalize(L + V);

                float diff = max(dot(N, L), 0.0);
                float spec = 0.0;
                if (diff > 0.0)
                    spec = pow(max(dot(N, H), 0.0), shininess);

                vec3 Kd = vec3(1.0);
                if (showTexture)
                    Kd = texture2D(texSampler, vTexCoord).rgb;
                vec3 Ks = vec3(1.0);
                vec3 color = Kd * diff + Ks * spec;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        this.prog = InitShaderProgram(vsSource, fsSource);
        this.aPos = gl.getAttribLocation(this.prog, "pos");
        this.aTex = gl.getAttribLocation(this.prog, "texCoord");
        this.aNorm = gl.getAttribLocation(this.prog, "normal");
        this.uMVP = gl.getUniformLocation(this.prog, "mvp");
        this.uMV = gl.getUniformLocation(this.prog, "mv");
        this.uNormalMatrix = gl.getUniformLocation(this.prog, "normalMatrix");
        this.uSwapYZ = gl.getUniformLocation(this.prog, "swapYZ");
        this.uShowTex = gl.getUniformLocation(this.prog, "showTexture");
        this.uLightDir = gl.getUniformLocation(this.prog, "lightDir");
        this.uShininess = gl.getUniformLocation(this.prog, "shininess");
        this.uTexSampler = gl.getUniformLocation(this.prog, "texSampler");
        this.posBuffer = gl.createBuffer();
        this.texBuffer = gl.createBuffer();
        this.normBuffer = gl.createBuffer();
        this.texture = gl.createTexture();
        this.numVertices = 0;
    }
   // This method is called every time the user opens an OBJ file.
    setMesh(vertPos, texCoords, normals) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        this.numVertices = vertPos.length / 3;
    }
    //This method is called when the user changes the state of the "Swap Y-Z Axes" checkbox. 
    swapYZ(swap) {
        gl.useProgram(this.prog);
        gl.uniform1i(this.uSwapYZ, swap ? 1 : 0);
    }
    // This method is called to draw the triangular mesh.
    draw(matrixMVP, matrixMV, matrixNormal) {
        gl.useProgram(this.prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.enableVertexAttribArray(this.aPos);
        gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.enableVertexAttribArray(this.aTex);
        gl.vertexAttribPointer(this.aTex, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
        gl.enableVertexAttribArray(this.aNorm);
        gl.vertexAttribPointer(this.aNorm, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(this.uMVP, false, matrixMVP);
        gl.uniformMatrix4fv(this.uMV, false, matrixMV);
        gl.uniformMatrix3fv(this.uNormalMatrix, false, matrixNormal);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uTexSampler, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }   
    // This method is called to set the texture of the mesh.
    setTexture(img) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
   // This method is called when the user changes the state of th "Show Texture" checkbox. 
    showTexture(show) {
        gl.useProgram(this.prog);
        gl.uniform1i(this.uShowTex, show ? 1 : 0);
    }
	// This method is called to set the incoming light direction
    setLightDir(x, y, z) {
        gl.useProgram(this.prog);
        const len = Math.hypot(x, y, z);
        if (len > 0.0001) {
            gl.uniform3f(this.uLightDir, x / len, y / len, z / len);
        }
    }
	// This method is called to set the shininess of the material
    setShininess(shininess) {
        gl.useProgram(this.prog);
        gl.uniform1f(this.uShininess, shininess);
    }
}
