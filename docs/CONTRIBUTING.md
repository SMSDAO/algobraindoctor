# Contributing to AlgoBrainDoctor

Thank you for your interest in contributing to AlgoBrainDoctor! This document provides guidelines and instructions for contributing to the project.

---

## 🎯 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility and apologize when you make mistakes
- Focus on what is best for the community and project

---

## 🚀 Getting Started

### Prerequisites

Before you begin contributing, ensure you have:

1. **Node.js 20+** installed
2. **npm or pnpm** package manager
3. **Git** for version control
4. A **GitHub account**
5. Basic knowledge of **React**, **TypeScript**, and **Tailwind CSS**

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/algobraindoctor.git
   cd algobraindoctor
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/SMSDAO/algobraindoctor.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Open http://localhost:5173 in your browser

---

## 🔄 Contribution Workflow

### 1. Before You Start

- **Check existing issues** - Someone might already be working on it
- **Create or comment on an issue** - Discuss your proposed changes
- **Wait for feedback** - Maintainers will guide you

### 2. Making Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly:
   ```bash
   npm run lint    # Check code style
   npm run build   # Ensure it builds
   ```

4. **Commit your changes** with clear messages:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### 3. Submitting Changes

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link to related issues
   - Add screenshots for UI changes

3. **Respond to feedback**:
   - Address reviewer comments
   - Update your PR as needed
   - Be patient and respectful

### 4. After Merge

1. **Update your local repository**:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Delete your feature branch** (optional):
   ```bash
   git branch -d feature/your-feature-name
   ```

---

## 💻 Coding Standards

### TypeScript

- **Use TypeScript** for all new files
- **Define explicit types** - Avoid `any`
- **Use interfaces** for object shapes
- **Document complex types** with comments

**Example:**
```typescript
interface Repository {
  id: string
  owner: string
  name: string
  healthScore: number
  // ... more properties
}
```

### React Components

- **Use functional components** with hooks
- **Keep components small** and focused (< 300 lines)
- **Use proper prop types** with TypeScript interfaces
- **Memoize expensive computations** with `useMemo`
- **Extract reusable logic** into custom hooks

**Example:**
```typescript
interface VitalsModalProps {
  repo: Repository
  isOpen: boolean
  onClose: () => void
}

export function VitalsModal({ repo, isOpen, onClose }: VitalsModalProps) {
  // Component implementation
}
```

### Styling

- **Use Tailwind CSS** for styling
- **Follow the AuraFX design system** (see PRD.md)
- **Use semantic color variables** from theme
- **Keep custom CSS minimal** - prefer Tailwind utilities

**Example:**
```tsx
<div className="rounded-lg border border-violet-500/30 bg-gray-900/50 p-6 shadow-lg shadow-violet-500/20">
  {/* Content */}
</div>
```

### File Organization

```
src/
├── components/         # React components
│   ├── ComponentName.tsx
│   └── ui/            # UI primitives (shadcn/ui)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and types
│   ├── types.ts       # TypeScript types
│   ├── utils.ts       # Helper functions
│   └── seedData.ts    # Mock data generators
└── main.tsx           # App entry point
```

### Naming Conventions

- **Components**: PascalCase (`VitalsModal.tsx`)
- **Hooks**: camelCase with "use" prefix (`useMobile.ts`)
- **Types/Interfaces**: PascalCase (`Repository`, `TimelineEvent`)
- **Functions**: camelCase (`formatTimestamp`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`)
- **CSS Classes**: kebab-case for custom classes

---

## 🧪 Testing Guidelines

### Manual Testing

Before submitting a PR:

1. **Test all affected features** thoroughly
2. **Test on different screen sizes** (mobile, tablet, desktop)
3. **Test browser compatibility** (Chrome, Firefox, Safari, Edge)
4. **Test with sample data** and edge cases
5. **Verify no console errors** or warnings

### Testing Checklist

- [ ] Feature works as expected
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Builds successfully
- [ ] Responsive on all screen sizes
- [ ] Follows design system
- [ ] No performance regressions
- [ ] Accessibility guidelines followed

---

## 📝 Commit Message Guidelines

We follow the **Conventional Commits** specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic changes)
- **refactor**: Code refactoring (no feature changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Other changes (dependencies, configs)

### Examples

```bash
# Feature addition
git commit -m "feat(timeline): add event filtering by severity"

# Bug fix
git commit -m "fix(charts): resolve score history calculation error"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(hooks): extract common logic to useKV hook"
```

### Subject Line Rules

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters
- Be specific and descriptive

---

## 🎨 Design Guidelines

### AuraFX Design System

Follow these principles when adding UI elements:

1. **Surgical Precision** - Every interaction is deterministic
2. **Neo-Medical Cyber** - Dark laboratory aesthetic with neon glows
3. **Operator-Grade Control** - Zero visual noise, critical data surfaced instantly

### Color Palette

- **Violet Aura** (`#A78BFA`) - Primary actions, identity
- **Aqua Pulse** (`#4FD1C5`) - Health indicators, success
- **Coral Heat** (`#F87171`) - Alerts, errors
- **Cyber Yellow** (`#FACC15`) - Warnings, caution

### Typography

- **Headings**: Space Grotesk (Bold/SemiBold/Medium)
- **Body**: Inter (Regular)
- **Code/Data**: JetBrains Mono (Regular)

### Animations

- **Duration**: 120-180ms for micro-interactions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` - no bounce
- **Purpose**: State changes, live updates, attention direction

---

## 📦 Pull Request Guidelines

### PR Title

Use the same format as commit messages:
```
feat(component): brief description
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List specific changes
- Be detailed and clear

## Screenshots
(For UI changes)

## Testing
- [ ] Tested locally
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Cross-browser tested

## Related Issues
Closes #123

## Additional Notes
Any additional context
```

### Review Process

1. **Automated checks** must pass (linting, build)
2. **At least one approval** from maintainers
3. **All conversations resolved**
4. **No merge conflicts** with main branch

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** - Bug might already be reported
2. **Try latest version** - Bug might already be fixed
3. **Reproduce the bug** - Ensure it's consistent

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
(If applicable)

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 4.0.0]

## Additional Context
Any other relevant information
```

---

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues** - Feature might already be requested
2. **Review roadmap** - Feature might be planned
3. **Consider alternatives** - Is there another way?

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this address?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other relevant information
```

---

## 🎓 Learning Resources

### Project-Specific

- [Architecture Documentation](ARCHITECTURE.md) - System design
- [API Reference](API.md) - Component APIs
- [Development Guide](DEVELOPMENT.md) - Setup and workflow

### External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🏆 Recognition

Contributors are recognized in:

- **GitHub Contributors** page
- **Release notes** for significant contributions
- **Documentation credits** for major doc improvements

---

## 📞 Getting Help

### Community Support

- **GitHub Discussions** - Ask questions, share ideas
- **GitHub Issues** - Report bugs, request features
- **Pull Request Comments** - Get code review feedback

### Maintainer Contact

For sensitive issues or questions:
- Open a private security advisory
- Contact maintainers directly through GitHub

---

## 🔒 Security Contributions

**Never commit sensitive data** to the repository:
- API keys, tokens, passwords
- Private configuration files
- Personal identifiable information (PII)

For security vulnerabilities, see [SECURITY.md](SECURITY.md).

---

## ✅ Contribution Checklist

Before submitting your PR, ensure:

- [ ] Code follows project style guidelines
- [ ] TypeScript types are properly defined
- [ ] No console errors or warnings
- [ ] Tested on multiple screen sizes
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventions
- [ ] PR description is complete
- [ ] All checks pass
- [ ] Screenshots included (for UI changes)

---

## 🙏 Thank You!

Your contributions make AlgoBrainDoctor better for everyone. Whether it's code, documentation, bug reports, or feature ideas - every contribution matters.

**Happy coding! 🧠⚡**

---

**Version:** 4.0.0  
**Last Updated:** 2024-01-28  
**Maintained By:** AlgoBrainDoctor Core Team
