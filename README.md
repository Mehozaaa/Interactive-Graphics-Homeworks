# Interactive-Graphics-Homeworks
This repository contains Interactive Graphics Homeworks.
The README file contains the breakdown of each of the homeworks

***Homework 1 solution break-down: 

We saw in the lecture that raster images are stored in one-dimensional array even though they represent a two-dimensional grid. This is why the first step of the code was to extract data arrays and dimensions of background and foreground images.

In the second step, I used a loop to iterate over foreground pixels (located by x,y coordinates) then added the fgpos to find the corresponding location on the background, and if the coordinate falls outside the background then the pixel is skipped.

In the third step I used the formula (y * width + x) * 4 to calculate the index for any of the pixels.

In the lecture we saw that typical raster images use 8 bits per channel, meaning color values range from 0 to 255. For the purpose of blending in the fourth step of the code, I normalized the alpha values to fall in the 0–1 range, then scaled the foreground’s alpha by the global opacity (fgOpac). 

Then I used the formula outAlpha = fgAlpha + bgAlpha × (1 – fgAlpha) (over blending as presented in the slides) to ensure that the opacity of the foreground and the background are combined correctly.

Then the formula outChannel = (foregroundChannel × fgAlpha + backgroundChannel × bgAlpha × (1 – fgAlpha)) / outAlpha  on each color channel to ensure that the final pixel colors reflect the influence of both images according to their opacities.

In the final step, after computing the blended values, I wrote back into the background image’s data array the new values and converted the alpha values back to 0-255 scale to ensure consistency with the rest of image data.

*****Homework2 Breakdown**:

The main goal of the project is to  to build and combine 2D transformations (scale, rotate, and translate) into single 3×3 matrices.

GetTransform function, takes as na input positionX/positionY (how to translate the final object in X and Y), rotationDeg (how many degrees to rotate clockwise) and scale (which is a scale factor). And as an output it returns A flat array representing a 3×3 matrix in column‑major order (as requested).

Inside the function I start by converting the degree to radians since Math.cos and Math.sin (c and s) that are the cosine and sine of θ expect radians.
After that I build 3 matrices Scaling Matrix(SM), Rotation Matrix(RM) and translation Matrix(TM)

In the next block of code there are 2 outer loops to go through rows and colums and one inner lop that  takes the selected row from the first matrix and the selected column from the second matrix, multiplies each pair of elements, and adds those products together to compute the single entry at that row × column cell. And as a result we get the combined scale and rotation matrix (RotSc).

After that, follwing the same pattern as before, I applied the translation on the RotSc matrix, combining TM and RotSc. As a result I get a final matrix (FM) that scale, rotate and translate in a single multiply.

In the second part of the code, there is the ApplyTransform function that takes 2 matrices, each of them does onne transform and outputs a new 3x3 matrix (in column‑major order) that combines both transforms.

Inside the function, there 2 outer loops that go through rows and colums to pich which cell is being filled and an inner loop takes that row’s three numbers and that column’s three numbers, multiplies them, adds them up, and that sum is the number that is assigned to that cell. Note that when you use the resulting matrix on any point, it first does trans1 to that point, and then feeds the outcome into trans2.

***Homework 3 solution break-down: 

PS: PLEASE WHEN YOU ADD A TEXTURE CHECK AND UNCHECK THE BOX TO APPLY IT TO THE OBJECT FOR BOTH HWK 3 and 4

In GetModelViewProjection function

I first compute cosX, sinX, cosY, and sinY from the input angles rotationX and rotationY so that we can build the rotation matrices as shown in lecture.

Then I construct the X-axis rotation matrix and the Y-axis rotation matrix in column-major order, each modifying the identity by inserting the appropriate cosine and sine values into a 2×2 block.

After that I create a translation matrix by taking the 4×4 identity and placing translationX, translationY, and translationZ in its bottom row to shift the model in space.

Then using MatrixMult function I combine transforms and finally I multiply the given projectionMatrix by this model matrix and return the resulting MVP matrix in column-major order.

For the MeshDrawer
I first start by writinh and compiloinh the vertex shader and the fragment shader, which chooses between sampling a texture or coloring by depth.

Then I create two GPU buffers for vertex positions and UVs and allocate a texture object. By initializing flags swapFlag = false and isTextureShown = false, bind the sampler uniform to texture unit 0, and call gl.useProgram(this.prog) to set up defaults.

When setMesh(vertPos, texCoords) is called, I bind each buffer in turn, upload the data as Float32Array, and set numVertices = vertPos.length / 3 so the draw call knows how many vertices to render.

Then using swapYZ(swap) I update this.swapFlag and immediately upload it (as 0 or 1) to the swapYZ uniform, exactly as we learned for conditional shader behavior.

In the draw(mvpMatrix) method, I re-bind the program, bind the position and UV buffers, enable and point the attributes, upload mvpMatrix, swapFlag, and isTextureShown to their uniforms, bind the texture to unit 0 if needed, and then call gl.drawArrays(gl.TRIANGLES, 0, this.numVertices) to render the mesh.

And the setTexture(img) is used to bind the texture object, flip the image vertically, upload it with texImage2D, generate mipmaps, set linear filtering for minification/magnification, and set wrapping to repeat on both axes.

Finally, showTexture(show) is used to update this.isTextureShown and upload it to the showTexture uniform so the fragment shader either samples the texture or falls back to the depth-based color, just like we’ve seen lecture demos.

***Homework 4 solution break-down: 

In addition to everything from Project 3, in project 4 two new methods for Blinn–Phong control were added:
setLightDir(x, y, z)that is used to normalize  the given (x,y,z) vector and uploads it to the lightDir uniform so the shader’s diffuse and specular terms use the correct light direction.

and setShininess(shininess) that is used to upload the chosen shininess exponent to the shininess uniform so the fragment shader computes spec = pow(max(dot(N,H),0), shininess) with the desired level of shininess.

***Homework 5 solution break-down: 

In the first step, I defined GLSL structs—Ray, Material, Sphere, Light, and HitInfo—to organize ray origin/direction, surface properties (diffuse, specular, shininess), sphere geometry, point lights, and intersection results (distance, position, normal, material). These structs set up all data needed for intersection tests and shading.

In the second step, I declared uniforms for the shader to access every sphere, every light, the cube‐map environment, and a bounce limit, and I defined a small epsilon to offset secondary rays slightly to avoid self‐hits. These uniforms ensure the shader knows the full scene and how deep reflections may go.

In the third step, I wrote the intersection routine: for each sphere, compute quadratic coefficients from the ray origin, direction, and sphere center/radius, check the discriminant, pick the nearest valid hit above epsilon, and update HitInfo whenever this hit is closer than any previous one. By the end of the loop, we have the closest sphere intersection or none.

In the fourth step, I implemented Blinn–Phong shading with shadows: for each light, cast a shadow ray from the hit point offset along the normal, skip light contribution if occluded, otherwise accumulate diffuse via normal · light direction and specular via the half‐vector formula. Summing over lights yields the direct illumination at the hit.

In the fifth step, I set up the main ray‐tracer entry: test the primary ray against all spheres; if no hit, sample the environment map along the ray direction and return that color; if a hit, compute view direction, shade locally, extract the material’s specular coefficient as a reflection‐accumulation factor, compute the reflection direction, and prepare position/normal for recursion.

In the final step, I loop up to the bounce limit (or until specular energy is negligible): for each bounce, offset the origin along the current normal, cast a reflected ray, and if it hits another sphere, shade that hit point, multiply its shading by the accumulated specular factor, add to the running color, attenuate the specular factor by the new material’s specular, and update for the next bounce. If the reflection ray misses, sample the environment map along that direction, add its contribution, and break. Finally, the accumulated color is returned with full opacity.

***Homework 6 solution break-down:

In the first part of the simulation code, I started by initializing the forces for each particle to zero, then added gravity to all of them based on the particle mass and the gravity vector passed to the function.

In the next step, I looped through all the springs to compute spring forces. For each spring I calculated the direction and length, then used Hooke’s law to compute the force based on how far the current spring length is from the rest length. I also added damping by projecting the velocity difference of the two particles along the spring direction, and then added/subtracted the total force from the connected particles.

After computing the total force acting on each particle, I used semi-implicit Euler integration to update both velocities and positions. I first updated velocity using acceleration (force divided by mass) and then updated position using the new velocity.

Then in the last part of the function, I handled collisions with the walls of the box by checking if any particle went outside the [-1,1] range in x, y, or z direction. If it did, I clamped the position and reversed the velocity component (scaled by the restitution factor) to simulate bouncing.

For displaying and shading the cloth and 3D objects, I copy/pasted the entire code from Project 4 (project4_Shading), which already includes everything needed for vertex and fragment shaders, Blinn–Phong lighting, handling textures, toggling the swapYZ option, setting up light direction and shininess, and managing GPU buffers. I reused this part as-is to handle rendering, since the focus of this project was on the simulation part.

