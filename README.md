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
