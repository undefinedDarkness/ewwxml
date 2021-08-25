## EWW XML -> YUCK Converter
A tool to convert eww's legacy xml configuration to its new yuck config language.
Please do make issues if you encounter any compatability problems. So far I think I've got the major ones but there will always be edge-cases
**NOTE:** Things will be supported based on how much pain they are to implement.

## Installation & Usage
You'll need [node](https://nodejs.org/en/download/package-manager/) & its package manager (npm) installed.
```
git clone https://github.com/undefinedDarkness/ewwxml
cd ewwxml
npm install # To install dependencies
npm run build # Build typescript
node out/main.js <PATH-TO-EWW-XML-FILE> <PATH-TO-YUCK-FILE> 
```

## TODO:
- [x] Fix inline strings
- [ ] Make output not garbage
- [x] Make it easier to use
- [ ] Fix minor differences
- [ ] Test more throughly (on Axarva & adi's configs)
