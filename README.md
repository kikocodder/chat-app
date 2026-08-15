
# Kikocodder Chat App

A modern chat application with avatar fallback support, built with TypeScript and Node.js.

## Overview

Kikocodder Chat App is a real-time messaging application that provides seamless communication with intelligent avatar fallback mechanisms. The application ensures users always have a visual identifier, even when custom avatars are unavailable.

## Features

- **Real-time Messaging**: Instant message delivery and receipt
- **Avatar Fallback System**: Automatic fallback to generated avatars when custom ones fail
- **TypeScript Support**: Full type safety and modern JavaScript features
- **ES Modules**: Native ECMAScript module support
- **Lightweight**: Minimal dependencies for fast performance
- **Cross-platform**: Runs on any Node.js environment

## Tech Stack

- **Language**: TypeScript / JavaScript (ES Modules)
- **Runtime**: Node.js (v18+ recommended)
- **Package Manager**: npm
- **Testing**: Native Node.js test runner
- **License**: MIT

## Getting Started

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kikocodder/kikocodder-chat-app.git
   cd kikocodder-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory (if required by the application):

```env
# Example environment variables
PORT=3000
NODE_ENV=development
```

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The application will be available at `http://localhost:3000` (or the port specified in your environment variables).

## Testing

Run the test suite using the built-in test runner:

```bash
npm test
```

This executes the avatar fallback tests located in `test/avatar.test.js`.

## Project Structure

```
kikocodder-chat-app/
├── src/                 # Source code (TypeScript)
├── test/                # Test files
│   └── avatar.test.js   # Avatar fallback tests
├── package.json         # Project configuration
└── README.md            # This file
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Reporting Issues

1. Check if the issue already exists in the [Issues](https://github.com/kikocodder/kikocodder-chat-app/issues) section
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (if applicable)
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear, descriptive commits
4. Ensure all tests pass: `npm test`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request with:
   - Reference to related issue(s)
   - Description of changes
   - Screenshots (if UI changes)

### Code Style

- Follow TypeScript best practices
- Use ES Modules (`import`/`export`)
- Write tests for new functionality
- Keep commits atomic and well-described

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**kikocodder** - [GitHub](https://github.com/kikocodder)

---

*For more information, visit the [project repository](https://github.com/kikocodder/kikocodder-chat-app).*
