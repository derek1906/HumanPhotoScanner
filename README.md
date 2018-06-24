# HumanPhotoScanner
Crowd-sourced tool for old photo meta data identification, including:
- Orientation
- Date
- Location
- Cropping

Work in progress.

## Dependencies

### Development
- npm
- Webpack 4+
- Gulp
- Babel

### Server side
- Python 3.6+
- Flask
- Flask-SQLAlchemy
- sqlite3

### Client side
- React

## Setting up the environment
Install sqlite3 (or any other database you like) if not already in system.

### Installation
To install all python modules, use the `requirements.txt` file:

    pip install -r requirements.txt

To install all node packages:

    cd web
    npm install

### Building
There are several pre-made npm shortcuts:

    npm run clean      # clean directory
    npm run build      # build (prod)
    npm run build-dev  # build (dev)
    npm run watch      # build (dev) and watch for changes

### Running the Code
Run `server.py` with python:

    python server.py