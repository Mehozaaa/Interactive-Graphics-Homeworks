# Interactive-Graphics-Homeworks
This repository contains Interactive Graphics Homeworks.

Homework 1 solution break-down: 

We saw in the lecture that raster images are stored in one-dimensional array even though they represent a two-dimensional grid. This is why the first step of the code was to extract data arrays and dimensions of background and foreground images.

In the second step, I used a loop to iterate over foreground pixels (located by x,y coordinates) then added the fgpos to find the corresponding location on the background, and if the coordinate falls outside the background then the pixel is skipped.

In the third step I used the formula (y * width + x) * 4 to calculate the index for any of the pixels.

In the lecture we saw that typical raster images use 8 bits per channel, meaning color values range from 0 to 255. For the purpose of blending in the fourth step of the code, I normalized the alpha values to fall in the 0–1 range, then scaled the foreground’s alpha by the global opacity (fgOpac). 

Then I used the formula outAlpha = fgAlpha + bgAlpha × (1 – fgAlpha) (over blending as presented in the slides) to ensure that the opacity of the foreground and the background are combined correctly.

Then the formula outChannel = (foregroundChannel × fgAlpha + backgroundChannel × bgAlpha × (1 – fgAlpha)) / outAlpha  on each color channel to ensure that the final pixel colors reflect the influence of both images according to their opacities.

In the final step, after computing the blended values, I wrote back into the background image’s data array the new values and converted the alpha values back to 0-255 scale to ensure consistency with the rest of image data.
