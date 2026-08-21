# SKY --- Device Community Website

> **SKY --- Built for everyone.**

Official community website for **SKY**, an Android smartphone/device
project.

## Overview

This project is the web platform for the SKY device community. It
provides a clean, minimal, PixelOS-inspired experience while keeping the
focus on useful device and community information.

**Live website:** https://sky-roms.vercel.app/

## Features

-   SKY landing page
-   Device information and specifications
-   Available AOSP/custom ROM directory
-   ROM information and details
-   Admin and developer profiles
-   Community/project information
-   Responsive desktop and mobile experience
-   Dark and light themes
-   Smooth, subtle animations
-   Custom 404 page
-   Vercel deployment

## Design Direction

The visual direction is inspired by modern Android/open-source project
websites, particularly the simple, content-focused approach associated
with PixelOS.

The goal is to keep the interface:

-   Minimal
-   Fast
-   Content-focused
-   Responsive
-   Professional
-   Easy to maintain

Animations and decorative effects are secondary to the actual project
information.

## ROM Directory

The website can present available ROMs for SKY with information such as:

-   ROM name
-   Android version
-   Official / Unofficial status
-   Maintainer
-   Latest build
-   Download/source information

Only verified project information should be presented as real device or
ROM data.

## Team

The website includes profiles for SKY administrators and developers,
recognizing the people responsible for maintaining and developing the
project.

## Development

Clone the repository:

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_DIRECTORY>
```

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

Create a production build:

``` bash
npm run build
```

Preview the production build:

``` bash
npm run preview
```

Follow the scripts defined in `package.json` if the project uses
different commands.

## Deployment

The production website is deployed using Vercel.

``` text
Local development
       ↓
GitHub
       ↓
Vercel
       ↓
Production website
```

The connected production branch can automatically trigger a new Vercel
deployment when changes are pushed.

## Project Structure

A typical structure includes:

``` text
.
├── public/
│   └── admins/
├── src/
├── package.json
├── README.md
└── ...
```

The exact structure may evolve with the project.

## Contributing

Before submitting changes:

1.  Keep existing functionality working.
2.  Test desktop and mobile layouts.
3.  Test both dark and light themes.
4.  Check image and static-asset paths.
5.  Run a production build.
6.  Verify the deployed result when applicable.

## Credits

**SKY Project**

Website design and development by the SKY project contributors.

Built for an open-source Android device community.

## License

Add the project's intended license before publishing a license claim. If
no license has been selected yet, do not claim a specific open-source
license.

------------------------------------------------------------------------

**SKY --- Built for everyone.**
