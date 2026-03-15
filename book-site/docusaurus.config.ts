import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A Practical Guide to Embodied Intelligence',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://hassam-rauf.github.io',
  baseUrl: '/Book_1/',

  organizationName: 'hassam-rauf',
  projectName: 'Book_1',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Humanoid Robotics',
      logo: {
        alt: 'Physical AI Book Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Textbook',
        },
        {
          href: 'https://github.com/hassam-rauf/Book_1',
          label: 'GitHub',
          position: 'right',
        },
        {
          to: '/login',
          label: 'Log In',
          position: 'right',
        },
        {
          to: '/signup',
          label: 'Sign Up',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Textbook',
          items: [
            {label: 'Preface', to: '/docs/intro'},
            {label: 'Module 1: ROS 2', to: '/docs/module-1/ch01-intro-physical-ai'},
            {label: 'Module 2: Gazebo', to: '/docs/module-2/ch06-gazebo-simulation'},
            {label: 'Module 3: NVIDIA Isaac', to: '/docs/module-3/ch08-nvidia-isaac'},
            {label: 'Module 4: VLA', to: '/docs/module-4/ch11-humanoid-kinematics'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Capstone Project', to: '/docs/capstone/ch14-autonomous-humanoid'},
            {label: 'Appendices', to: '/docs/appendices/a1-hardware-setup'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Textbook. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'cpp', 'yaml', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
