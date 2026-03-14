# Research: Book Content — Write 19 Chapters

**Date**: 2026-03-08 | **Feature**: 002-write-chapters

## Decision 1: Chapter Section Structure

**Decision**: Standardized 9-section template for main chapters; 7-section template for appendices.

**Rationale**: Consistent structure lets readers know where to find each content type without cognitive overhead. "Learning Objectives first" is a proven instructional design pattern (Bloom's Taxonomy). "Hands-On Exercise last" ensures students understand concepts before attempting tasks.

**Alternatives considered**:
- Free-form structure per chapter — rejected; inconsistency hurts readability and RAG retrieval.
- Interleaved theory + exercise — rejected; harder to skim for students reviewing specific concepts.

---

## Decision 2: Tutorial Style ("Why Before How")

**Decision**: Every concept section opens with motivation ("why does this exist?") before introducing mechanics ("how does it work?").

**Rationale**: Beginner learners disengage when confronted with syntax before purpose. The "why before how" pattern is used by O'Reilly Learning Paths and ROS 2 official tutorials. Clarified by user in sp.clarify session.

**Alternatives considered**:
- Academic definition-first style — rejected; better for reference manuals, not learning-focused textbooks.
- Problem-solution format — partially adopted; each chapter intro frames the problem the technology solves.

---

## Decision 3: ROS 2 Humble as Default

**Decision**: All ROS 2 examples target Ubuntu 22.04 + ROS 2 Humble (LTS, EOL May 2027).

**Rationale**: Humble is the current LTS release with the widest community adoption and longest support window. Most beginner tutorials and hardware (Jetson, UR robots) have Humble-compatible packages.

**Alternatives considered**:
- ROS 2 Jazzy (latest) — rejected; fewer community resources; some hardware packages not yet ported.
- ROS 2 Iron — rejected; approaching EOL; no advantage over Humble for learners.

---

## Decision 4: Python Primary, C++ for Industry-Standard Cases

**Decision**: Python is used for all ROS 2 examples. C++ examples added only for performance-critical patterns (e.g., real-time controllers) where the industry uses C++ exclusively.

**Rationale**: Python lowers the barrier for beginners. ROS 2 Python client library (rclpy) has feature parity with rclcpp for most use cases covered in this textbook.

**Alternatives considered**:
- C++ primary — rejected; higher barrier, slower feedback loop for beginners.
- Both languages equally — rejected; doubles example count without adding learning value for intro-level content.

---

## Decision 5: Mermaid for All Diagrams

**Decision**: All architecture diagrams use Mermaid (flowchart, sequenceDiagram, graph LR). No external image files.

**Rationale**: Mermaid renders natively in Docusaurus 3 with `@docusaurus/theme-mermaid` (already installed in F1). Text-based diagrams are version-controlled, diffable, and accessible. No image hosting needed.

**Alternatives considered**:
- Draw.io exported PNGs — rejected; binary files, not diffable, requires external tooling.
- ASCII art — rejected; poor accessibility and renders inconsistently across fonts.

---

## Decision 6: Code Block Format

**Decision**: All code blocks include: (1) language identifier, (2) title comment with filename, (3) inline comments explaining non-obvious lines, (4) `# Expected output:` comment block at the end where applicable.

**Rationale**: Filename headers help students navigate multi-file examples. Expected output comments let students verify results without running code, supporting offline learning.

**Example format**:
```python
# File: ~/ros2_ws/src/my_package/my_package/talker.py

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Talker(Node):
    def __init__(self):
        super().__init__('talker')  # Node name visible in ros2 node list
        self.publisher = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(0.5, self.publish_message)

    def publish_message(self):
        msg = String()
        msg.data = 'Hello, Robot!'
        self.publisher.publish(msg)

# Expected output (after ros2 run):
# [INFO] [talker]: Publishing: 'Hello, Robot!'
```

---

## Decision 7: Cross-Reference Format

**Decision**: Cross-references use relative Docusaurus links with descriptive anchor text.

**Example**: `See [ROS 2 Nodes and Topics](../module-1/ch04-ros2-nodes-topics.md) for publisher/subscriber patterns.`

**Rationale**: Relative links work in both dev server and GitHub Pages. Docusaurus validates broken links at build time, catching dead cross-references automatically.

---

## Decision 8: Hardware Callout Pattern

**Decision**: Code or exercises requiring physical hardware are marked with an admonition block:

```markdown
:::caution Hardware Required
This exercise requires a physical robot arm or Jetson device.
**Simulation alternative**: See [Gazebo Simulation](../module-2/ch06-gazebo-simulation.md) to run this in simulation instead.
:::
```

**Rationale**: Students without hardware should not be blocked from learning. Simulation alternatives ensure all exercises are accessible.
