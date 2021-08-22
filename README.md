# Eww -> Yuck Converter
A tool to convert eww's legacy configurations (in XML) to its new shiny
yuck configuration format.
(DO NOT EXPECT THIS TO BE PERFECT, IF YOU ENCOUNTER ACTUAL ISSUES: Feel free to make a issue)

## Installation & Usage
You'll need [node](https://nodejs.org/en/download/package-manager/) & npm installed.
```
git clone https://github.com/undefinedDarkness/ewwxml
cd ewwxml
npm install
npm run build
node out/main.js <PATH-TO-EWW-XML-FILE> >> <PATH-TO-YUCK-FILE> # Do not forget the >> in the middle.
```


## TODO:
- [x] Fix inline strings
- [ ] Make output not garbage
- [ ] Make it easier to use
- [ ] Fix minor differences
- [ ] Test more throughly (on Arxava & adi's config)
