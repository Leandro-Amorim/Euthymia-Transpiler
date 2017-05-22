var fs = require('fs');
var path = require('path');
var writeJsonFile = require('write-json-file');

var stringUtils = require('./components/string-utils');
var parser = require('./components/parser');

var gmPath = "Path/To/Project.gmx/Folder";
var outputFolder = ""

var templates = {
  'boot' : "templates/boot.txt",
  'setup' : "templates/boot.txt"

};

/*
if(outputFolder.charAt(outputFolder.length-1) != '/')
{
  outputFolder = outputFolder + '/';
}*/

var Project = parser.parseProject(gmPath);

writeJsonFile.sync("export.json", Project,{indent: 2});
