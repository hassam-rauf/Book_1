import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const modules = [
  {
    title: 'Module 1: The Robotic Nervous System',
    description: 'Master ROS 2 — nodes, topics, services, and Python-based robot control across 5 weeks.',
    link: '/docs/module-1/ch01-intro-physical-ai',
    emoji: '🤖',
  },
  {
    title: 'Module 2: The Digital Twin',
    description: 'Build and simulate robots in Gazebo using URDF/SDF robot descriptions.',
    link: '/docs/module-2/ch06-gazebo-simulation',
    emoji: '🌐',
  },
  {
    title: 'Module 3: The AI-Robot Brain',
    description: 'Leverage NVIDIA Isaac Sim for photorealistic simulation, VSLAM, and sim-to-real transfer.',
    link: '/docs/module-3/ch08-nvidia-isaac',
    emoji: '🧠',
  },
  {
    title: 'Module 4: Vision-Language-Action',
    description: 'Integrate LLMs and speech for conversational robotics and autonomous humanoid control.',
    link: '/docs/module-4/ch11-humanoid-kinematics',
    emoji: '🗣️',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          A comprehensive textbook for the Physical AI & Humanoid Robotics course —
          covering ROS 2, Gazebo, NVIDIA Isaac, and Vision-Language-Action models
          across 13 weeks of hands-on learning.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Reading →
          </Link>
          <Link
            className={clsx('button button--outline button--lg', styles.buttonSecondary)}
            to="/docs/capstone/ch14-autonomous-humanoid">
            View Capstone Project
          </Link>
        </div>
      </div>
    </header>
  );
}

function ModuleCard({title, description, link, emoji}: typeof modules[0]) {
  return (
    <div className={clsx('col col--3', styles.moduleCard)}>
      <div className="card shadow--md">
        <div className="card__header">
          <span className={styles.moduleEmoji}>{emoji}</span>
          <h3>{title}</h3>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
        <div className="card__footer">
          <Link className="button button--primary button--sm" to={link}>
            Explore Module
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Physical AI & Humanoid Robotics — A practical textbook covering ROS 2, Gazebo, NVIDIA Isaac, and VLA models.">
      <HomepageHeader />
      <main>
        <section className={styles.modulesSection}>
          <div className="container">
            <Heading as="h2" className={styles.sectionTitle}>Course Modules</Heading>
            <div className="row">
              {modules.map((m) => (
                <ModuleCard key={m.title} {...m} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
