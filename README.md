# Rive Tester

A testing environment for Rive animations with dual logging (browser console + terminal).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Place your Rive animation files (.riv) in the `/animations` directory

## Usage

### Running Tests
```bash
npm test
```

### Development Mode (with watch)
```bash
npm run dev
```

## Project Structure

- `/animations` - Rive animation files
- `/tests` - Test suites and utilities
- `/logs` - Test output and logs

## Features

- Dual logging (browser console + terminal)
- Real-time WebSocket communication
- Comprehensive error handling
- Performance monitoring
- Self-documenting tests

## Dependencies

- @rive-app/canvas - Rive runtime
- express - Web server
- ws - WebSocket server
- chalk - Terminal styling

## Contributing

1. Follow the rules in `.cursor/rules.mdc`
2. Maintain dual logging for all tests
3. Document all changes
4. Include test cases 