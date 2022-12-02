# Get Down Polaroid Slider

#### A lightweight WordPress slider plugin with an option to turn your slides into polaroid pictures.[^note]

**Installation:**

Download the zip file from here (Code > Download Zip), rename it `getdown.zip`, then install it via your WordPress plugin page by clicking "Upload Plugin".

[Demo 1](https://davidpottercodes.com/getdown)

[Demo 2](https://davidpottercodes.com/getdown/polaroid-style/) with `polaroid_style` enabled

**Shortcode Example:**

```
[getdown image_urls="https://examplesite.com/wp-content/uploads/2022/04/slide_01.jpg, https://examplesite.com/wp-content/uploads/2022/04/slide_02.jpg, https://examplesite.com/wp-content/uploads/2022/04/slide_03.jpg, https://examplesite.com/wp-content/uploads/2022/04/slide_04.jpg" durations_in_milliseconds="4000, 4000, 4000, 4000"]
```

#### Shortcode Options:

**image_descriptions:**

Add for each slide an image alt description for users unable to view them. Example:

```
image_descriptions="Man dancing, DJ performing, Crowd dancing to music, Crowd celebrating"
```

**messages:**

Include a short message for each slide. Omit a slide’s message by changing it to a dash. This example omits the third message:

```
messages="DO A LITTLE DANCE, MAKE A LITTLE LOVE, -, GET DOWN TONIGHT"
```

**pause_on_scroll:**

Set this to yes in order for the slider to automatically pause when the user scrolls. Example:

```
pause_on_scroll="yes"
```

**pause_when_viewing_another_tab:**

Set this to yes in order for the slider to automatically pause when the user switches away to a different window. Example:

```
pause_when_viewing_another_tab="yes"
```

**polaroid_style:**

Set this to yes in order for each slide to appear as a polaroid photo. Example:

```
polaroid_style="yes"
```

**polaroid-style-width:**

Specify a width for your slider when it is in polaroid style. Accepts values in px or vw, not %. Will also accept min(), max(), or clamp(). Examples:

```
polaroid-style-width="450px"
```

```
polaroid-style-width="50vw"
```

```
polaroid-style-width="clamp(360px, 50vw, 500px)"
```

##### Shortcode example with all options included:

```
[getdown image_urls="https://example.com/slide1.jpg, https://examplesite.com/slide2.jpg, https://examplesite.com/slide3.jpg, https://examplesite.com/slide4.jpg" durations_in_milliseconds="4000, 4000, 4000, 4000" image_descriptions="Man dancing, DJ performing, Crowd dancing to music, Crowd celebrating" messages="DO A LITTLE DANCE, MAKE A LITTLE LOVE, -, GET DOWN TONIGHT" pause_on_scroll="yes" pause_when_viewing_another_tab="yes" polaroid_style="yes" polaroid-style-width="clamp(360px, 50vw, 500px)"]
```
