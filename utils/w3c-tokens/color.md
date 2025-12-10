[↑ Jump to Table of Contents](#toc)[→ Pop Out Sidebar](#toc) ![](https://www.w3.org/StyleSheets/TR/2021/logos/dark.svg 'theme toggle icon') light dark auto

[![Design Tokens Community Group](/assets/dtcg-logo-on-color.svg) ](https://www.designtokens.org)

# Design Tokens Color Module 2025.10

[Final Community Group Report](https://www.w3.org/standards/types#reports) 28 October 2025

This version:

<https://www.designtokens.org/TR/2025.10/color/>

Latest published version:

<https://www.designtokens.org/TR/2025.10/color/>

Editors:

[Ayesha Mazrana (Mazumdar)](https://github.com/ayeshakmaz)

[Kathleen McMahon](https://kathleenmcmahon.dev)

[Adekunle Oduye](https://www.adekunleoduye.com)

[Matthew Ström-Awn](https://matthewstrom.com)

Feedback:

[GitHub design-tokens/community-group](https://github.com/design-tokens/community-group/) ([pull requests](https://github.com/design-tokens/community-group/pulls/),[new issue](https://github.com/design-tokens/community-group/issues/new/choose),[open issues](https://github.com/design-tokens/community-group/issues/))

[Copyright](https://www.w3.org/policies/#copyright) © 2025 the Contributors to the Design Tokens Resolver Module 2025.10 Specification, published by the[Design Tokens Community Group](https://www.w3.org/groups/cg/design-tokens) under the[W3C Community Final Specification Agreement (FSA)](https://www.w3.org/community/about/agreements/fsa/). A human-readable[summary](https://www.w3.org/community/about/agreements/fsa-deed/) is available.

---

## Abstract

This document describes the technical specification for design token color values and opacity.

## Status of This Document

This specification was published by the[Design Tokens Community Group](https://www.w3.org/groups/cg/design-tokens). It is not a W3C Standard nor is it on the W3C Standards Track. Please note that under the[W3C Community Final Specification Agreement (FSA)](https://www.w3.org/community/about/agreements/final/) other conditions apply. Learn more about[W3C Community and Business Groups](https://www.w3.org/community/).

This section describes the status of this document at the time of its publication. Other documents may supersede this document. A list of current W3C Community Group reports and the latest revision of this report can be found in the W3C Community Group reports index at<https://www.w3.org/community/reports/>.

This document was published by the DTCG as a[Candidate Recommendation](https://www.w3.org/policies/process/#RecsCR) following the definitions provided by the W3C process. Contributions to this draft are governed by[ Community Contributor License Agreement (CLA)](https://www.w3.org/community/about/process/cla), as specified by the[W3C Community Group Process](https://www.w3.org/community/about/process/#cgroups).

While not a W3C recommendation, this classification is intended to clarify that, after extensive consensus-building, this specification is intended for implementation.

**This specification is considered stable**. Further updates will be provided in superseding specifications.

[GitHub Issues](https://github.com/design-tokens/community-group/issues/) are preferred for discussion of this specification.

## Table of Contents

1. [Abstract](#abstract)
2. [Status of This Document](#sotd)
3. [1\. Conformance](#conformance)
4. [2\. Introduction](#introduction)
   1. [2.1 Color Tokens](#color-tokens)
5. [3\. Color terminology](#color-terminology)
6. [4\. Color type](#color-type)
   1. [4.1 Format](#format)
      1. [4.1.1 The none keyword](#the-none-keyword)
         1. [4.1.1.1 Using the none keyword](#using-the-none-keyword)
   2. [4.2 Supported Color spaces](#supported-color-spaces)
      1. [4.2.1 sRGB](#srgb)
         1. [4.2.1.1 Components](#components)
      2. [4.2.2 sRGB linear](#srgb-linear)
         1. [4.2.2.1 Components](#components-0)
      3. [4.2.3 HSL](#hsl)
         1. [4.2.3.1 Components](#components-1)
      4. [4.2.4 HWB](#hwb)
         1. [4.2.4.1 Components](#components-2)
      5. [4.2.5 CIELAB](#cielab)
         1. [4.2.5.1 Components](#components-3)
      6. [4.2.6 LCH](#lch)
         1. [4.2.6.1 Components](#components-4)
      7. [4.2.7 OKLAB](#oklab)
         1. [4.2.7.1 Components](#components-5)
      8. [4.2.8 OKLCH](#oklch)
         1. [4.2.8.1 Components](#components-6)
      9. [4.2.9 Display P3](#display-p3)
         1. [4.2.9.1 Components](#components-7)
      10. [4.2.10 A98 RGB](#a98-rgb)
          1. [4.2.10.1 Components](#components-8)
      11. [4.2.11 ProPhoto RGB](#prophoto-rgb)
          1. [4.2.11.1 Components](#components-9)
      12. [4.2.12 Rec 2020](#rec-2020)
          1. [4.2.12.1 Components](#components-10)
      13. [4.2.13 XYZ-D65](#xyz-d65)
          1. [4.2.13.1 Components](#components-11)
      14. [4.2.14 XYZ-D50](#xyz-d50)
          1. [4.2.14.1 Components](#components-12)
   3. [4.3 Future color space support](#future-color-space-support)
7. [5\. Gamut mapping](#gamut-mapping)
8. [6\. Interpolation](#interpolation)
9. [7\. Token naming](#token-naming)
   1. [7.1 Categorization](#categorization)
      1. [7.1.1 Base](#base)
      2. [7.1.2 Alias](#alias)
      3. [7.1.3 Component](#component)
   2. [7.2 Naming strategies](#naming-strategies)
      1. [7.2.1 Base Tokens](#base-tokens)
         1. [7.2.1.1 Descriptive](#descriptive)
         2. [7.2.1.2 Numerical](#numerical)
         3. [7.2.1.2.1 Ordered scales](#ordered-scales)
         4. [7.2.1.2.2 Bounded scales](#bounded-scales)
         5. [7.2.1.2.3 Computer generated scales](#computer-generated-scales)
      2. [7.2.2 Alias Tokens](#alias-tokens)
      3. [7.2.3 Component Tokens](#component-tokens)
10. [A. Issue summary](#issue-summary)
11. [B. References](#references)
12. [B.1 Normative references](#normative-references)

## 1\. Conformance

[](#conformance)

As well as sections marked as non-normative, all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.

The key words _MAY_, _MUST_, and _MUST NOT_ in this document are to be interpreted as described in[BCP 14](https://www.rfc-editor.org/info/bcp14) \[[RFC2119](#bib-rfc2119 'Key words for use in RFCs to Indicate Requirement Levels')\] \[[RFC8174](#bib-rfc8174 'Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words')\] when, and only when, they appear in all capitals, as shown here.

## 2\. Introduction

[](#introduction)

### 2.1 Color Tokens

[](#color-tokens)

Color tokens can be used to represent colors in different color spaces. Colors represented in tokens can then be converted to other color spaces by translation tools.

Generally speaking, this module uses [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) for reference to concepts and terminology. [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) is a W3C Working Draft and is not a final specification. It is subject to change and may not be implemented in all browsers or platforms.

Editor's note: Why CSS Color Module Level 4?

Color is a complex topic. [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) provides a comprehensive baseline:

- It provides a definition of common color spaces, including gamuts and component coordinates
- It gives technical specifications for translating colors between color spaces
- Its authors are experts in the field of color science
- As a spec it must reach an extremely high standard of implementability and precision

Using this spec as a reference allows us to focus on the design and implementation of the tokens themselves, rather than the underlying color science.

It is not an endorsement of CSS as a default implementation for color tokens.

## 3\. Color terminology

[](#color-terminology)

This section provides a high-level overview of the terminology used in the specification and how it relates to [color science](https://en.wikipedia.org/wiki/Color%5Fscience) and [colorimetry](https://en.wikipedia.org/wiki/Colorimetry).

Color space

A color space is a specific organization of colors, which helps in the reproduction of color in both physical and digital realms. It defines a range of colors that can be represented and manipulated.

Color model

A color model is a mathematical representation of colors within a specific [color space](#dfn-color-space). It defines how colors are represented as numerical values, typically using components.

Color gamut

A color gamut is the complete range of colors that can be represented in a specific color space. It defines the limits of color reproduction for that space.

Component

A component is a single value that defines a part of a color in a specific color space. For example, in the RGB color space, the components are red, green, and blue.

Hue

Hue is the attribute of a color that allows it to be classified as red, green, blue, etc. In many color spaces, hue is represented as an angle on a color wheel. Different color spaces may position colors differently on the wheel.

Saturation

Saturation is the colorfulness of a color relative to its own brightness. It describes how much gray is present in a color. A fully saturated color has no gray, while a desaturated color appears more grayish. It is inherently tied to both [chroma](#dfn-chroma) and [lightness](#dfn-lightness), especially in models like HSL or HSV. A color can be highly saturated but still appear light or dark depending on its lightness.

Lightness

Lightness is the perceived brightness of a color. It describes how light or dark a color appears.

Chroma

Chroma refers to the colorfulness of a color relative to the brightness of a similarly illuminated white. It measures how pure or intense a color appears. In the CIE LCH color model (Lightness, Chroma, Hue), Chroma is independent of lightness and expresses how far a color is from neutral gray along the chromatic axis.

Alpha

Alpha is a component that represents the transparency of a color. It defines how opaque or transparent a color is, with the minimum value (usually 0) being fully transparent and the maximum value (usually 1) being fully opaque.

## 4\. Color type

[](#color-type)

Represents a color.

### 4.1 Format

[](#format)

For color tokens, the `$type` property _MUST_ be set to the string `color`.

The `$value` property can then be used to specify the details of the color, The `$value` object contains the following properties:

- `colorSpace` (required): A string that specifies the [color space](#dfn-color-space) or [color model](#dfn-color-model). For supported color spaces, see the [supported color spaces](#supported-color-spaces) section below.
- `components` (required): An array representing the color [components](#dfn-components). The number of components depends on the color space. Each element of the array _MUST_ be either:
  - A number
  - The 'none' keyword
- `alpha` (optional): A number that represents the [alpha](#dfn-alpha) value of the color. This value is between `0` and `1`, where `0` is fully transparent and `1` is fully opaque. If omitted, the alpha value of the color _MUST_ be assumed to be 1 (fully opaque).
- `hex` (optional): A string that represents a fallback value of the color. The fallback color _MUST_ be formatted in [6 digit CSS hex color notation](https://www.w3.org/TR/css-color-4/#hex-notation) format to avoid conflicts with the provided alpha value.

[Example 1](#example-1)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [1, 0, 1],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  },
  "Translucent shadow": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [0, 0, 0],
      "alpha": 0.5,
      "hex": "#000000"
    }
  }
}

```

#### 4.1.1 The `none` keyword

[](#the-none-keyword)

When specifying a color in some color spaces, a value of `0` could be ambiguous. For example, in the HSL color space, colors with a [hue](#dfn-hue) of `0` are red; while a single color like `hsl(0, 0, 50)` would not be rendered as red, it may be treated as a completely desaturated red when interpolated with other colors. Therefore, in certain color spaces, `0` is insufficient to indicate that there is no value for a given component.

[CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) has introduced the `none` keyword to indicate that a component is missing, or not applicable. For example, in the HSL color space, the `none` keyword may be used to indicate that there is no angle value for the color; a color with a hue value of `none` _MAY_ be rendered differently from a color with a hue angle of `0`, or result in different colors when [interpolating](https://www.w3.org/TR/css-color-4/#interpolation-missing).

##### 4.1.1.1 Using the `none` keyword

[](#using-the-none-keyword)

The `none` keyword _MAY_ be used in the `components` array to indicate that a component is not applicable or not specified.

[Example 2](#example-2)

```
{
  "White": {
    "$type": "color",
    "$value": {
      "colorSpace": "hsl",
      "components": ["none", 0, 100],
      "alpha": 1,
      "hex": "#ffffff"
    }
  }
}

```

Contrast this with the following example where the Hue is specified as `0`:

[Example 3](#example-3)

```
{
  "White": {
    "$type": "color",
    "$value": {
      "colorSpace": "hsl",
      "components": [0, 0, 100],
      "alpha": 1,
      "hex": "#ffffff"
    }
  }
}

```

While both examples will render as white, the first example is more explicit about the fact that the hue is not applicable. This is important when interpolating between colors or mixing colors, where using colors with components of `0` or `none` can yield different results.

### 4.2 Supported Color spaces

[](#supported-color-spaces)

The following values are supported for the `colorSpace` property. The `components` array will vary depending on the color space.

Editor's note: Syntax for expressing ranges

In this table, brackets `[]` indicate that an extrema are included, parentheses `()` indicate that the [extrema](https://en.wikipedia.org/wiki/Maximum%5Fand%5Fminimum) are excluded. For example, in the HSL color space, hue is in the range of [\[0 - 360\]](https://www.w3.org/TR/css-color-4/#hue-syntax), which means that `0` _MAY_ be used but `360` _MUST NOT_ be used.

| Color Space  | Key                                 | Values    |             |
| ------------ | ----------------------------------- | --------- | ----------- |
| sRGB         | "srgb"                              | Red       | \[0 - 1\]   |
| Green        | \[0 - 1\]                           |           |             |
| Blue         | \[0 - 1\]                           |           |             |
| sRGB linear  | "srgb-linear"                       | Red       | \[0 - 1\]   |
| Green        | \[0 - 1\]                           |           |             |
| Blue         | \[0 - 1\]                           |           |             |
| HSL          | "hsl"                               | Hue       | \[0 - 360)  |
| Saturation   | \[0 - 100\]                         |           |             |
| Lightness    | \[0 - 100\]                         |           |             |
| HWB          | "hwb"                               | Hue       | \[0 - 360)  |
| Whiteness    | \[0 - 100\]                         |           |             |
| Blackness    | \[0 - 100\]                         |           |             |
| CIELAB       | "lab"                               | Lightness | \[0 - 100\] |
| A            | \[-Infinity - Infinity\][\*](#fn-1) |           |             |
| B            | \[-Infinity - Infinity\][\*](#fn-1) |           |             |
| LCH          | "lch"                               | Lightness | \[0 - 100\] |
| Chroma       | \[0 - Infinity\][\*\*](#fn-2)       |           |             |
| Hue          | \[0 - 360)                          |           |             |
| OKLAB        | "oklab"                             | Lightness | \[0 - 1\]   |
| A            | \[-Infinity - Infinity\][†](#fn-3)  |           |             |
| B            | \[-Infinity - Infinity\][†](#fn-3)  |           |             |
| OKLCH        | "oklch"                             | Lightness | \[0 - 1\]   |
| Chroma       | \[0 - Infinity\][‡](#fn-4)          |           |             |
| Hue          | \[0 - 360)                          |           |             |
| Display P3   | "display-p3"                        | Red       | \[0 - 1\]   |
| Green        | \[0 - 1\]                           |           |             |
| Blue         | \[0 - 1\]                           |           |             |
| A98 RGB      | "a98-rgb"                           | Red       | \[0 - 1\]   |
| Green        | \[0 - 1\]                           |           |             |
| Blue         | \[0 - 1\]                           |           |             |
| ProPhoto RGB | "prophoto-rgb"                      | Red       | \[0 - 1\]   |
| Green        | \[0 - 1\]                           |           |             |
| Blue         | \[0 - 1\]                           |           |             |
| Rec 2020     | "rec2020"                           | Red       | \[0 - 1\]   |
| Green        | \[0 - 1\]                           |           |             |
| Blue         | \[0 - 1\]                           |           |             |
| XYZ-D65      | "xyz-d65"                           | X         | \[0 - 1\]   |
| Y            | \[0 - 1\]                           |           |             |
| Z            | \[0 - 1\]                           |           |             |
| XYZ-D50      | "xyz-d50"                           | X         | \[0 - 1\]   |
| Y            | \[0 - 1\]                           |           |             |
| Z            | \[0 - 1\]                           |           |             |

\* In CIELAB, A and B are unbounded but in practice don't exceed -160 to 160  
\*\* In LCH, C is unbounded but in practice doesn't exceed 230  
† In OKLAB, A and B are unbounded but in practice don't exceed -0.5 to 0.5  
‡ In OKLCH, Chroma is unbounded but in practice doesn't exceed 0.5

Editor's note: Precision in examples

The examples below have varying degrees of precision (i.e. numbers after the decimal). This is done to ensure that the `fallback` color is exactly the same as the defined color when converted to HEX. In practice, the numbers used to define each component can have any degree of precision.

Editor's note: Optional values in examples

The examples below are given with all optional values (alpha, hex) included for the purpose of completeness. Defining the alpha property for fully-opaque colors is not required, see <#format>.

Editor's note: How does this conform to CSS Color Module 4?

To provide a logically consistent approach without creating ambiguity around the format, this spec takes the following approach:

- If CSS Color Module 4 allows a color space to be referenced by **both** a named function (like `srgb()`) **and** a keyword in the `color()` function, use the format intended for the `color()` function.
- If CSS Color Module 4 only defines a color space **either** as a named function (like `hwb()`) **or** a keyword in the `color()` function (like `rec-2020`), use the syntax indicated.
- If CSS Color Module 4 allows **both** unit values (like `50`) **and** percentages (like `50%`) for a component, use the unit value.

Using this spec as a reference allows us to focus on the design and implementation of the tokens themselves, rather than the underlying color science.

#### 4.2.1 sRGB

[](#srgb)

sRGB was the standard color space for all CSS colors before CSS Color Module 4\. It is the most widely used color space on the web, and is the default color space for most design tools.

##### 4.2.1.1 Components

[](#components)

`[Red, Green, Blue]`

- Red: A number between `0` and `1` representing the red component of the color.
- Green: A number between `0` and `1` representing the green component of the color.
- Blue: A number between `0` and `1` representing the blue component of the color.

[Example 4](#example-4)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [1, 0, 1],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the sRGB color space, see [Multimedia systems and equipment - Colour measurement and management - Part 2-1: Colour management - Default RGB colour space - sRGB](https://webstore.iec.ch/publication/6169).

#### 4.2.2 sRGB linear

[](#srgb-linear)

sRGB linear is a linearized version of sRGB. It is used in some design tools to represent colors in a linear color space.

##### 4.2.2.1 Components

[](#components-0)

`[Red, Green, Blue]`

- Red: A number between `0` and `1` representing the red component of the color.
- Green: A number between `0` and `1` representing the green component of the color.
- Blue: A number between `0` and `1` representing the blue component of the color.

[Example 5](#example-5)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb-linear",
      "components": [1, 0, 1],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the sRGB linear color space, see [Multimedia systems and equipment - Colour measurement and management - Part 2-1: Colour management - Default RGB colour space - sRGB](https://webstore.iec.ch/publication/6169).

#### 4.2.3 HSL

[](#hsl)

HSL is a [color model](#dfn-color-model) that is a polar transformation of sRGB, supported as early as CSS Color Level 3.

##### 4.2.3.1 Components

[](#components-1)

`[Hue, Saturation, Lightness]`

- Hue: A number from `0` up to (but not including) `360`, but representing the [hue](#dfn-hue) angle of the color on the color wheel.
- Saturation: A number between `0` and `100` representing the percentage of color [saturation](#dfn-saturation).
- Lightness: A number between `0` and `100` representing the percentage of [lightness](#dfn-lightness).

[Example 6](#example-6)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "hsl",
      "components": [330, 100, 50],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the HSL color space, see [HSL: light vs saturation](http://www.cwi.nl/~steven/css/hsl.html).

#### 4.2.4 HWB

[](#hwb)

Another [color model](#dfn-color-model), a polar transformation of sRGB.

##### 4.2.4.1 Components

[](#components-2)

`[Hue, Whiteness, Blackness]`

- Hue: A number from `0` up to (but not including) `360` representing the angle of the color on the color wheel.
- Whiteness: A number between `0` and `100` representing the percentage of white in the color.
- Blackness: A number between `0` and `100` representing the percentage of black in the color.

[Example 7](#example-7)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "hwb",
      "components": [330, 0, 0],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the HWB color space, see [HWB — A More Intuitive Hue-Based Color Model](http://alvyray.com/Papers/CG/HWB%5FJGTv208.pdf).

#### 4.2.5 CIELAB

[](#cielab)

CIELAB is a color space that is designed to be perceptually uniform.

##### 4.2.5.1 Components

[](#components-3)

`[L, A, B]`

- L: A number between `0` and `100` representing the percentage of lightness of the color.
- A: A signed number representing the green-red axis of the color.
- B: A signed number representing the blue-yellow axis of the color.

A and B are theoretically unbounded, but in practice don't exceed -160 to 160.

[Example 8](#example-8)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "lab",
      "components": [60.17, 93.54, -60.5],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the CIELAB color space, see [ISO/CIE 11664-4:2019(E): Colorimetry — Part 4: CIE 1976 L\*a\*b\* colour space](http://cie.co.at/publications/colorimetry-part-4-cie-1976-lab-colour-space-1).

#### 4.2.6 LCH

[](#lch)

LCH is a cylindrical representation of CIELAB.

##### 4.2.6.1 Components

[](#components-4)

`[L, C, Hue]`

- L: A number between `0` and `100` representing the percentage of lightness of the color.
- C: A number representing the chroma of the color.
- Hue: A number from `0` up to (but not including) `360` representing the angle of the color on the color wheel.

The minimum value of C is `0`, which represents a neutral color (gray), and its maximum is theoretically unbounded, but in practice doesn't exceed 230.

[Example 9](#example-9)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "lch",
      "components": [60.17, 111.4, 327.11],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the LCH color space, see [the CIELAB and LCH section of CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/#cie-lab).

#### 4.2.7 OKLAB

[](#oklab)

OKLAB is a perceptually uniform [color space](#dfn-color-space) that is designed to be more accurate than CIELAB.

##### 4.2.7.1 Components

[](#components-5)

`[L, A, B]`

- L: A number between `0` and `1` representing the lightness of the color.
- A: A signed number representing the green-red axis of the color.
- B: A signed number representing the blue-yellow axis of the color.

Like in CIELAB, A and B are theoretically unbounded, but in practice don't exceed -0.5 to 0.5.

[Example 10](#example-10)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "oklab",
      "components": [0.701, 0.2746, -0.169],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the OKLAB color space, see [OKLAB: A Perceptually Uniform Color Space](https://bottosson.github.io/posts/oklab/).

#### 4.2.8 OKLCH

[](#oklch)

OKLCH is a cylindrical [color model](#dfn-color-model) of OKLAB.

##### 4.2.8.1 Components

[](#components-6)

`[L, Chroma, Hue]`

- L: A number between `0` and `1` representing the lightness of the color.
- Chroma: A number representing the chroma of the color.
- Hue: A number from `0` up to (but not including) `360` representing the angle of the color on the color wheel.

Like in LCH, the minimum value of Chroma is `0`, which represents a neutral color (gray), and its maximum is theoretically unbounded, but in practice doesn't exceed 0.5.

[Example 11](#example-11)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "oklch",
      "components": [0.7016, 0.3225, 328.363],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the OKLCH color space, see [OKLAB: A Perceptually Uniform Color Space](https://bottosson.github.io/posts/oklab/).

#### 4.2.9 Display P3

[](#display-p3)

Display P3 is a [color space](#dfn-color-space) that is designed to be used in displays with a wide color [gamut](#dfn-gamut). It is based on the P3 color space used in digital cinema.

##### 4.2.9.1 Components

[](#components-7)

`[Red, Green, Blue]`

- Red: A number between `0` and `1` representing the red component of the color.
- Green: A number between `0` and `1` representing the green component of the color.
- Blue: A number between `0` and `1` representing the blue component of the color.

[Example 12](#example-12)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "display-p3",
      "components": [1, 0, 1],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the Display P3 color space, see [the definition of Display P3](https://www.color.org/chardata/rgb/DisplayP3.xalter).

#### 4.2.10 A98 RGB

[](#a98-rgb)

A98 RGB is a color space that is designed to be used in displays with a wide color gamut. It is based on the Adobe RGB color space.

##### 4.2.10.1 Components

[](#components-8)

`[Red, Green, Blue]`

- Red: A number between `0` and `1` representing the red component of the color.
- Green: A number between `0` and `1` representing the green component of the color.
- Blue: A number between `0` and `1` representing the blue component of the color.

[Example 13](#example-13)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "a98-rgb",
      "components": [1, 0, 1],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

To learn more about the A98 color space, see the [Adobe RGB color space article on Wikipedia](https://en.wikipedia.org/wiki/Adobe%5FRGB%5Fcolor%5Fspace).

#### 4.2.11 ProPhoto RGB

[](#prophoto-rgb)

ProPhoto RGB is a color space that is designed to be used in displays with a wide color gamut. It is based on the ProPhoto RGB color space.

##### 4.2.11.1 Components

[](#components-9)

`[Red, Green, Blue]`

- Red: A number between `0` and `1` representing the red component of the color.
- Green: A number between `0` and `1` representing the green component of the color.
- Blue: A number between `0` and `1` representing the blue component of the color.

[Example 14](#example-14)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "prophoto-rgb",
      "components": [1, 0, 1],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the ProPhoto RGB color space, see [Design and Optimization of the ProPhoto RGB Color Encodings](https://www.realtimerendering.com/blog/2011-color-and-imaging-conference-part-vi-special-session/).

#### 4.2.12 Rec 2020

[](#rec-2020)

Rec 2020 is a color space that is designed to be used in displays with a wide color gamut. It is based on the Rec 2020 color space.

##### 4.2.12.1 Components

[](#components-10)

`[Red, Green, Blue]`

- Red: A number between `0` and `1` representing the red component of the color.
- Green: A number between `0` and `1` representing the green component of the color.
- Blue: A number between `0` and `1` representing the blue component of the color.

[Example 15](#example-15)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "rec2020",
      "components": [1, 0, 1],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the Rec 2020 color space, see [Recommendation ITU-R BT.2020-2: Parameter values for ultra-high definition television systems for production and international programme exchange ](http://www.itu.int/rec/R-REC-BT.2020/en).

#### 4.2.13 XYZ-D65

[](#xyz-d65)

XYZ-D65 is a color space that is designed to be able to represent all colors that can be perceived by the human eye. It is a fundamental color space — all other spaces can be converted to and from XYZ. It is based on the CIE 1931 color space, using the D65 illuminant. XYZ is not commonly used in design tools, but is useful for color conversions.

##### 4.2.13.1 Components

[](#components-11)

`[X, Y, Z]`

- X: A number between `0` and `1` representing the X component of the color.
- Y: A number between `0` and `1` representing the Y component of the color.
- Z: A number between `0` and `1` representing the Z component of the color.

[Example 16](#example-16)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "xyz-d65",
      "components": [0.5929, 0.2848, 0.9699],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the XYZ-D65 color space, see [Colorimetry, Fourth Edition. CIE 015:2018](http://www.cie.co.at/publications/colorimetry-4th-edition).

#### 4.2.14 XYZ-D50

[](#xyz-d50)

XYZ-D50 is similar to XYZ-D65, but uses the D50 illuminant.

##### 4.2.14.1 Components

[](#components-12)

`[X, Y, Z]`

- X: A number between `0` and `1` representing the X component of the color.
- Y: A number between `0` and `1` representing the Y component of the color.
- Z: A number between `0` and `1` representing the Z component of the color.

[Example 17](#example-17)

```
{
  "Hot pink": {
    "$type": "color",
    "$value": {
      "colorSpace": "xyz-d50",
      "components": [0.5791, 0.2831, 0.728],
      "alpha": 1,
      "hex": "#ff00ff"
    }
  }
}

```

For more information on the XYZ-D50 color space, see [Colorimetry, Fourth Edition. CIE 015:2018](http://www.cie.co.at/publications/colorimetry-4th-edition).

### 4.3 Future color space support

[](#future-color-space-support)

Future versions of this spec may add support for additional color spaces, depending on adoption and support in design tools.

## 5\. Gamut mapping

[](#gamut-mapping)

_This section is non-normative._

Gamut mapping is the process of converting colors from one [color space](#dfn-color-space) to another.

Gamut mapping is necessary when the source color space has a larger gamut than the target color space. This can happen when converting colors from a wide-gamut color space (like Display-P3) to a smaller gamut color space (like sRGB). Gamut mapping ensures that the colors are represented accurately in the target color space, even if some colors cannot be represented exactly.

When transforming colors, translation tools _MAY_ use the gamut mapping algorithm that best fits the use case. For example, if the goal is to preserve the appearance of colors, a perceptual gamut mapping algorithm may be used. If the goal is to preserve the exact color values, a saturation or relative colorimetric gamut mapping algorithm may be used.

Token authors should be aware that the choice of gamut mapping algorithm can significantly affect the appearance of colors in the target color space. If colors need to be transformed between color spaces, it's important to validate the output of the translation tool to ensure that the colors are represented accurately and consistently.

## 6\. Interpolation

[](#interpolation)

_This section is non-normative._

In many cases, colors may be _interpolated_, or blended, to create new colors. For example, when creating a gradient, colors are often interpolated between two or more key colors.

Interpolation can be done in different [color spaces](#dfn-color-space), and the choice of color space can affect the appearance of the resulting colors. Translation tools _MAY_ use different interpolation methods depending on the color space and the desired effect. Authors should be aware of the implications of interpolation in different color spaces and validate interpolated colors to ensure they meet design requirements.

## 7\. Token naming

[](#token-naming)

_This section is non-normative._

### 7.1 Categorization

[](#categorization)

There are 3 main categories of design tokens that we will continue to reference in this specification.

#### 7.1.1 Base

[](#base)

Base tokens are the lowest level tokens.

[Example 18](#example-18)

```
{
  "color": {
    "green": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.67, 0.79, 0.74]
      }
    },
    "shadow": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0, 0, 0],
        "alpha": 0.53
      }
    }
  }
}

```

#### 7.1.2 Alias

[](#alias)

A design token’s value _MAY_ be a _reference_ to another token. The same value _MAY_ have multiple names or aliases.

[Example 19](#example-19)

```
{
  "color": {
    "palette": {
      "black": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0, 0, 0]
        }
      }
    },
    "text": {
      "base": {
        "$value": "{color.palette.black}"
      }
    }
  }
}

```

#### 7.1.3 Component

[](#component)

Component-specific tokens provide design decisions at the component level and improve the separation of concerns in your token architecture.

[Example 20](#example-20)

```
{
  "color": {
    "button": {
      "primary": {
        "$value": "{color.brand.primary}"
      }
    },
    "banner": {
      "background": {
        "$value": "{color.palette.black}"
      }
    }
  }
}

```

### 7.2 Naming strategies

[](#naming-strategies)

There are many naming options when it comes to design tokens, especially color type tokens. We’ve identified two that seem to be most commonly implemented, **descriptive and numerical**.

#### 7.2.1 Base Tokens

[](#base-tokens)

For **Base tokens**, here’s how they _MAY_ be represented in each version:

##### 7.2.1.1 Descriptive

[](#descriptive)

Descriptive names can be more emotional and human-friendly because they often relate to tangible things that people interact with, like grass or watermelon.

| Pros                                                                                                                          | Cons                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Easier for some people to identify with, could be used to distinguish brand colors from product colors                        | Harder to determine the scale of colors (for example: which ones are lighter vs. darker? How well do they pair together?) |
| Names may not be easily recognized by non-English speakers. For teams working across languages, this may not be a good choice |                                                                                                                           |

[Example 21](#example-21)

```
{
  "color": {
    "grass": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.67, 0.79, 0.74]
      }
    },
    "brand": {
      "watermelon": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.91, 0.28, 0.42]
        }
      }
    }
  }
}

```

##### 7.2.1.2 Numerical

[](#numerical)

###### 7.2.1.2.1 Ordered scales

[](#ordered-scales)

Numerical tokens often follow a scale to help delineate how the colors progress. For example, when using an ordered scale, `color.blue.500` may be the base color, where the lightest color value is `color.blue.100`, and the darkest value could be `color.blue.900`, and these values are ordered in increments of 100s in between. We recommend not using sequential numbers (ex: 1, 2, 3, 4) for scalability in case future colors need to be added in between two existing colors.

[Example 22](#example-22)

```
{
  "color": {
    "green": {
      "400": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.42, 0.73, 0.63]
        }
      },
      "500": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.15, 0.56, 0.42]
        }
      },
      "600": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.07, 0.5, 0.36]
        }
      }
    }
  }
}

```

Numerical token names can also allow for further specificity when needed. For example, when creating neutral palette tokens (like grays), the scale may increase by increments of 25 instead of 100 at the lightest values, and then increment by 100 thereafter.

[Example 23](#example-23)

```
{
  "color": {
    "gray": {
      "25": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.93, 0.93, 0.93],
        },
      },
      "50": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.87, 0.87, 0.87],
        },
      },
      "75": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.8, 0.8, 0.8],
        },
      },
      "100": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.73, 0.73, 0.73],
        },
      },
      // etc...
    },
  },
}

```

###### 7.2.1.2.2 Bounded scales

[](#bounded-scales)

Numerical tokens can also be named through **bounded scales**. These tokens utilize a distinguishing value based on the actual color used for the token, such as in HSL’s lightness value to vary shades of a tint.

[Example 24](#example-24)

```
{
  "color": {
    "gray": {
      "22": {
        "$type": "color",
        "$value": {
          "colorSpace": "hsl",
          "components": [0, 0, 22]
        }
      },
      "49": {
        "$type": "color",
        "$value": {
          "colorSpace": "hsl",
          "components": [0, 0, 49]
        }
      },
      "73": {
        "$type": "color",
        "$value": {
          "colorSpace": "hsl",
          "components": [0, 0, 73]
        }
      },
      "99": {
        "$type": "color",
        "$value": {
          "colorSpace": "hsl",
          "components": [0, 0, 99]
        }
      }
    }
  }
}

```

###### 7.2.1.2.3 Computer generated scales

[](#computer-generated-scales)

Token names _MAY_ also be generated by tools, where the user specifies the base name, and the tool appends scale numbers based on changes to the underlying value.

[Example 25](#example-25)

```
// User specified name: color-green
// Tool generated names for 6 steps of opacity
{
  "color": {
    "green": {
      "10": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.13, 0.7, 0.67],
          "alpha": 0.1,
        },
      },
      "20": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [0.13, 0.7, 0.67],
          "alpha": 0.2,
        },
      },
      // etc...
    },
  },
}

```

| Pros                                                                                                                                                                 | Cons                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Easy mapping between different tokens for color contrast. For example, all 100-400 tokens pair with 500-900 tokens in order to create accessible color combinations. | Less memorable and less obvious difference between tokens |
| If using bounded scales, the token name can help indicate something about the underlying value                                                                       |                                                           |

#### 7.2.2 Alias Tokens

[](#alias-tokens)

For **Alias Tokens**, we recommend grouping tokens with similar intentions by prioritizing the category + property within the name. For example, all background color Alias tokens would likely start with `color.background.XXX`.

We recommend avoiding abbreviations. For example, use “background” instead of “bg”, to help with clarity.

Here’s how alias tokens may be represented:

[Example 26](#example-26)

```
{
  "color": {
    "background": {
      "error": {
        "$value": "{color.red.600}"
      },
      "success": {
        "$value": "{color.green.400}"
      }
    },
    "text": {
      "base": {
        "$value": "{color.palette.black}"
      },
      "errorHover": {
        "$value": "{color.red.700}"
      }
    }
  }
}

```

Color alias tokens could also be grouped by concept, like so:

[Example 27](#example-27)

```
// These can be used for background, border, or text colors
{
  "color": {
    "background": {
      "error": {
        "$value": "{color.red.600}",
      },
      "success": {
        "$value": "{color.green.400}",
      },
    },
  },
}

```

#### 7.2.3 Component Tokens

[](#component-tokens)

Component-specific names should start with the component they support and be located close to the component code. They commonly refer to alias tokens and can be helpful when trying to use consistent styles across components while still maintaining separation of concerns.

[Example 28](#example-28)

```
{
  "color": {
    "badge": {
      "background": {
        "error": {
          "$value": "{color.background.error}"
        },
        "success": {
          "$value": "{color.background.success}"
        }
      },
      "text": {
        "error": {
          "$value": "{color.text.error}"
        },
        "success": {
          "$value": "{color.text.success}"
        }
      }
    }
  }
}

```

## A. Issue summary

[](#issue-summary)

There are no issues listed in this specification.

## B. References

[](#references)

### B.1 Normative references

[](#normative-references)

\[CIELAB\]

[ISO/CIE 11664-4:2019(E): Colorimetry — Part 4: CIE 1976 L\*a\*b\* colour space](http://cie.co.at/publications/colorimetry-part-4-cie-1976-lab-colour-space-1). International Organization for Standardization (ISO), International Commission on Illumination (CIE). 2019\. Published. URL: <http://cie.co.at/publications/colorimetry-part-4-cie-1976-lab-colour-space-1>

\[COLORIMETRY\]

[Colorimetry, Fourth Edition. CIE 015:2018](http://www.cie.co.at/publications/colorimetry-4th-edition). CIE. 2018\. URL: <http://www.cie.co.at/publications/colorimetry-4th-edition>

\[css-color-4\]

[CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/). Chris Lilley; Tab Atkins Jr.; Lea Verou. W3C. 24 April 2025\. CRD. URL: <https://www.w3.org/TR/css-color-4/>

\[hsl\]

[HSL: light vs saturation](http://www.cwi.nl/~steven/css/hsl.html). Steven Pemberton. 19 November 2009\. URL: <http://www.cwi.nl/~steven/css/hsl.html>

\[Rec.2020\]

[Recommendation ITU-R BT.2020-2: Parameter values for ultra-high definition television systems for production and international programme exchange ](http://www.itu.int/rec/R-REC-BT.2020/en). ITU. October 2015\. URL: <http://www.itu.int/rec/R-REC-BT.2020/en>

\[RFC2119\]

[Key words for use in RFCs to Indicate Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119). S. Bradner. IETF. March 1997\. Best Current Practice. URL: <https://www.rfc-editor.org/rfc/rfc2119>

\[RFC8174\]

[Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words](https://www.rfc-editor.org/rfc/rfc8174). B. Leiba. IETF. May 2017\. Best Current Practice. URL: <https://www.rfc-editor.org/rfc/rfc8174>

\[srgb\]

[Multimedia systems and equipment - Colour measurement and management - Part 2-1: Colour management - Default RGB colour space - sRGB](https://webstore.iec.ch/publication/6169). IEC. URL: <https://webstore.iec.ch/publication/6169>

[↑](#title)

[Permalink](#dfn-color-space)

**Referenced in:**

- [§ 3\. Color terminology](#ref-for-dfn-color-space-1 '§ 3. Color terminology')
- [§ 4.1 Format](#ref-for-dfn-color-space-2 '§ 4.1 Format')
- [§ 4.2.7 OKLAB](#ref-for-dfn-color-space-3 '§ 4.2.7 OKLAB')
- [§ 4.2.9 Display P3](#ref-for-dfn-color-space-4 '§ 4.2.9 Display P3')
- [§ 5\. Gamut mapping](#ref-for-dfn-color-space-5 '§ 5. Gamut mapping')
- [§ 6\. Interpolation](#ref-for-dfn-color-space-6 '§ 6. Interpolation')

[Permalink](#dfn-color-model)

**Referenced in:**

- [§ 4.1 Format](#ref-for-dfn-color-model-1 '§ 4.1 Format')
- [§ 4.2.3 HSL](#ref-for-dfn-color-model-2 '§ 4.2.3 HSL')
- [§ 4.2.4 HWB](#ref-for-dfn-color-model-3 '§ 4.2.4 HWB')
- [§ 4.2.8 OKLCH](#ref-for-dfn-color-model-4 '§ 4.2.8 OKLCH')

[Permalink](#dfn-gamut)

**Referenced in:**

- [§ 4.2.9 Display P3](#ref-for-dfn-gamut-1 '§ 4.2.9 Display P3')

[Permalink](#dfn-components)

**Referenced in:**

- [§ 4.1 Format](#ref-for-dfn-components-1 '§ 4.1 Format')

[Permalink](#dfn-hue)

**Referenced in:**

- [§ 4.1.1 The none keyword](#ref-for-dfn-hue-1 '§ 4.1.1 The none keyword')
- [§ 4.2.3.1 Components](#ref-for-dfn-hue-2 '§ 4.2.3.1 Components')

[Permalink](#dfn-saturation)

**Referenced in:**

- [§ 4.2.3.1 Components](#ref-for-dfn-saturation-1 '§ 4.2.3.1 Components')

[Permalink](#dfn-lightness)

**Referenced in:**

- [§ 3\. Color terminology](#ref-for-dfn-lightness-1 '§ 3. Color terminology')
- [§ 4.2.3.1 Components](#ref-for-dfn-lightness-2 '§ 4.2.3.1 Components')

[Permalink](#dfn-chroma)

**Referenced in:**

- [§ 3\. Color terminology](#ref-for-dfn-chroma-1 '§ 3. Color terminology')

[Permalink](#dfn-alpha)

**Referenced in:**

- [§ 4.1 Format](#ref-for-dfn-alpha-1 '§ 4.1 Format')
