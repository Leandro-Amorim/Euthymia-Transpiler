var fs = require('fs');
var path = require('path');

var parser = new window.DOMParser();

module.exports = {
  parseProject : function(gmPath){

    var Project = {
      path: "",
      sounds : [],
      sprites : [],
      backgrounds : [],
      scripts : [],
      fonts : [],
      objects : [],
      rooms : [],
      constants : [],
      extensions : []
    };


    if(gmPath.charAt(gmPath.length-1) != '/')
    {
      gmPath = gmPath + '/';
    }

    Project.path = gmPath;

    var gmPathFolder = fs.readdirSync(gmPath);

    var $ = null;

    for(var i=0; i<gmPathFolder.length;i++)
    {
      if(path.extname(gmPathFolder[i]) == ".gmx")
      {
        $ = parser.parseFromString(fs.readFileSync(gmPath+gmPathFolder[i]), "text/xml");
        break;
      }
    }

    var sounds = $.getElementsByTagName("sound");
    for(var i=0; i<sounds.length; i++)
    {
      Project.sounds.push(path.basename(sounds[i].innerHTML));
    }

    var sprites = $.getElementsByTagName("sprite");
    for(var i=0; i<sprites.length; i++)
    {
      Project.sprites.push(path.basename(sprites[i].innerHTML));
    }

    var backgrounds = $.getElementsByTagName("background");
    for(var i=0; i<backgrounds.length; i++)
    {
      Project.backgrounds.push(path.basename(backgrounds[i].innerHTML));
    }

    var scripts = $.getElementsByTagName("script");
    for(var i=0; i<scripts.length; i++)
    {
      Project.scripts.push(path.basename(scripts[i].innerHTML));
    }

    var fonts = $.getElementsByTagName("font");
    for(var i=0; i<fonts.length; i++)
    {
      Project.fonts.push(path.basename(fonts[i].innerHTML));
    }

    var objects = $.getElementsByTagName("object");
    for(var i=0; i<objects.length; i++)
    {
      Project.objects.push(path.basename(objects[i].innerHTML));
    }

    var rooms = $.getElementsByTagName("room");
    for(var i=0; i<rooms.length; i++)
    {
      Project.rooms.push(path.basename(rooms[i].innerHTML));
    }

    var constants = $.getElementsByTagName("constant");
    for(var i=0; i<constants.length; i++)
    {
      var c = {name: constants[i].getAttribute("name"), value: constants[i].innerHTML};
      Project.constants.push(c);
    }

    var extensions = $.getElementsByTagName("extension");
    for(var i=0; i<extensions.length; i++)
    {
      Project.extensions.push(path.basename(extensions[i].innerHTML));
    }


    ///////////////////Sprites
    for (var i = 0; i < Project.sprites.length; i++)
    {
      Project.sprites[i] = this.parseSprite(Project, Project.sprites[i]);
    }
    ///////////////////

    ///////////////////Objects
    for (var i = 0; i < Project.objects.length; i++)
    {
      Project.objects[i] = this.parseObject(Project, Project.objects[i]);
    }
    ///////////////////

    ///////////////////Rooms
    for (var i = 0; i < Project.rooms.length; i++)
    {
      Project.rooms[i] = this.parseRoom(Project, Project.rooms[i]);
    }
    ///////////////////


    return Project;

  },
  parseSprite : function(object, name){

    var sprite = {
      name: "",
      width: 0,
      height: 0,
      xOrigin: 0,
      yOrigin: 0,
      preciseCollision: false,
      images: [],
      frames: 0
    }

    sprite.name = name;

    var $ = parser.parseFromString(fs.readFileSync(object.path + 'sprites/' + name + ".sprite.gmx"), "text/xml");

    sprite.xOrigin = $.getElementsByTagName("xorig")[0].innerHTML;
    sprite.yOrigin = $.getElementsByTagName("yorigin")[0].innerHTML;

    sprite.width = $.getElementsByTagName("width")[0].innerHTML;
    sprite.height = $.getElementsByTagName("height")[0].innerHTML;

    var colKind = parseInt($.getElementsByTagName("colkind")[0].innerHTML);
    sprite.preciseCollision = !colKind;


    sprite.images = this.parseFrames($.getElementsByTagName("frames")[0].innerHTML);
    sprite.frames = sprite.images.length;


    return sprite;

  },
  parseFrames : function(framesString){

    var beginFrame = 0;
    var endFrame = 0;
    var str = framesString;
    var frames = [];

    while(str.indexOf("images", endFrame) != -1)
    {
      beginFrame = str.indexOf("images", endFrame);
      endFrame = str.indexOf(".png", beginFrame) + 4;
      frames.push(str.slice(beginFrame,endFrame));
    }

    return frames;


  },
  parseObject: function(object, name){

    var obj = {
      name: "",
      sprite: "",
      solid: false,
      visible: false,
      depth: 0,
      persistent: false,
      parent: "",
      mask: "",
      events: {},
      physics:{
        usePhysics: false,
        isSensor: false,
        shape: 0,
        density: 0,
        restitution: 0,
        group: 0,
        linearDamping: 0,
        angularDamping: 0,
        friction: 0,
        awake: false,
        kinematic: false,
        shapePoints: []
      }
    }

    obj.name = name;

    var $ = parser.parseFromString(fs.readFileSync(object.path + 'objects/' + name + ".object.gmx"), "text/xml");


    if ($.getElementsByTagName("spriteName")[0].innerHTML != "<undefined>" && $.getElementsByTagName("spriteName")[0].innerHTML != '&lt;undefined&gt;')
    {
      obj.sprite = $.getElementsByTagName("spriteName")[0].innerHTML;
    }

    obj.solid = !!parseInt($.getElementsByTagName("solid")[0].innerHTML);

    obj.visible = !!parseInt($.getElementsByTagName("visible")[0].innerHTML);
    obj.depth = parseInt($.getElementsByTagName("depth")[0].innerHTML);
    obj.persistent = !!parseInt($.getElementsByTagName("persistent")[0].innerHTML);

    if ($.getElementsByTagName("parentName")[0].innerHTML != '<undefined>' && $.getElementsByTagName("parentName")[0].innerHTML != '&lt;undefined&gt;')
    {
      obj.parent = $.getElementsByTagName("parentName")[0].innerHTML;
    }

    if ($.getElementsByTagName("maskName")[0].innerHTML != '<undefined>' && $.getElementsByTagName("maskName")[0].innerHTML != '&lt;undefined&gt;')
    {
      obj.mask = $.getElementsByTagName("maskName")[0].innerHTML;
    }

    obj.physics.usePhysics = !!parseInt($.getElementsByTagName("PhysicsObject")[0].innerHTML);
    obj.physics.isSensor = !!parseInt($.getElementsByTagName("PhysicsObjectSensor")[0].innerHTML);
    obj.physics.shape = parseInt($.getElementsByTagName("PhysicsObjectShape")[0].innerHTML);
    obj.physics.density = parseFloat($.getElementsByTagName("PhysicsObjectDensity")[0].innerHTML);
    obj.physics.restitution = parseFloat($.getElementsByTagName("PhysicsObjectRestitution")[0].innerHTML);
    obj.physics.group = parseInt($.getElementsByTagName("PhysicsObjectGroup")[0].innerHTML);
    obj.physics.linearDamping = parseFloat($.getElementsByTagName("PhysicsObjectLinearDamping")[0].innerHTML);
    obj.physics.angularDamping = parseFloat($.getElementsByTagName("PhysicsObjectAngularDamping")[0].innerHTML);
    obj.physics.friction = parseFloat($.getElementsByTagName("PhysicsObjectFriction")[0].innerHTML);
    obj.physics.awake = !!parseInt($.getElementsByTagName("PhysicsObjectAwake")[0].innerHTML);
    obj.physics.kinematic = !!parseInt($.getElementsByTagName("PhysicsObjectKinematic")[0].innerHTML);

    var points = $.getElementsByTagName("point");
    for(var i=0; i<points.length;i++)
    {
      var str = points[i].innerHTML;

      obj.physics.shapePoints.push(
        {
          x: parseInt(str.slice(0, str.indexOf(","))),
          y: parseInt(str.slice(str.indexOf(",")+1,str.length))
        });
    }

    if ($.querySelector('event[eventtype="0"] string')) {obj.events.create = $.querySelector('event[eventtype="0"] string').innerHTML;}
    if ($.querySelector('event[eventtype="3"][enumb="0"] string')) {obj.events.step = $.querySelector('event[eventtype="3"][enumb="0"] string').innerHTML;}
    if ($.querySelector('event[eventtype="3"][enumb="1"] string')) {obj.events.beginStep = $.querySelector('event[eventtype="3"][enumb="1"] string').innerHTML;}
    if ($.querySelector('event[eventtype="3"][enumb="2"] string')) {obj.events.endStep = $.querySelector('event[eventtype="3"][enumb="2"] string').innerHTML;}
    if ($.querySelector('event[eventtype="1"] string')) {obj.events.destroy = $.querySelector('event[eventtype="1"] string').innerHTML;}
    if ($.querySelector('event[eventtype="8"][enumb="0"] string')) {obj.events.draw = $.querySelector('event[eventtype="8"][enumb="0"] string').innerHTML;}
    if ($.querySelector('event[eventtype="8"][enumb="64"] string')) {obj.events.drawGUI = $.querySelector('event[eventtype="8"][enumb="64"] string').innerHTML;}
    if ($.querySelector('event[eventtype="8"][enumb="72"] string')) {obj.events.drawBegin = $.querySelector('event[eventtype="8"][enumb="72"] string').innerHTML;}
    if ($.querySelector('event[eventtype="8"][enumb="73"] string')) {obj.events.drawEnd = $.querySelector('event[eventtype="8"][enumb="73"] string').innerHTML;}
    if ($.querySelector('event[eventtype="8"][enumb="74"] string')) {obj.events.drawGUIBegin = $.querySelector('event[eventtype="8"][enumb="74"] string').innerHTML;}
    if ($.querySelector('event[eventtype="8"][enumb="75"] string')) {obj.events.drawGUIEnd = $.querySelector('event[eventtype="8"][enumb="75"] string').innerHTML;}

    for(var i=0; i< 12; i++)
    {
      if ($.querySelector('event[eventtype="2"][enumb="'+i+'"] string'))
      {
        obj.events["alarm"+String(i)]= $.querySelector('event[eventtype="2"][enumb="'+i+'"] string').innerHTML;
      }
    }

    //INCOMPLETO

    return obj;

  },
  parseRoom: function(object, name){

    var room = {
      name: "",
      caption: "",
      width: 0,
      height: 0,
      speed: 0,
      persistent: 0,
      backgroundColor: 0,
      showBackgroundColor: false,
      creationCode: "",
      enableViews: false,
      clearViewBackground: true,
      clearDisplayBuffer: true,
      backgrounds: [],
      views: [],
      instances: [],
      tiles: [],
      physics: {
        usePhysics: false,
        gravityX: 0,
        gravityY: 0,
        pixelsToMeters: 0
      }
    }

    room.name = name;

    var $ = parser.parseFromString(fs.readFileSync(object.path + 'rooms/' + name + ".room.gmx"), "text/xml");

    room.caption = $.getElementsByTagName("caption")[0].innerHTML;
    room.width = parseInt($.getElementsByTagName("width")[0].innerHTML);
    room.height = parseInt($.getElementsByTagName("height")[0].innerHTML);
    room.speed = parseInt($.getElementsByTagName("speed")[0].innerHTML);
    room.persistent = !!parseInt($.getElementsByTagName("persistent")[0].innerHTML);
    room.backgroundColor = parseInt($.getElementsByTagName("colour")[0].innerHTML);
    room.showBackgroundColor = !!parseInt($.getElementsByTagName("showcolour")[0].innerHTML);
    room.creationCode = $.getElementsByTagName("code")[0].innerHTML;
    room.enableViews = !!parseInt($.getElementsByTagName("enableViews")[0].innerHTML);
    room.clearViewBackground = !!parseInt($.getElementsByTagName("clearViewBackground")[0].innerHTML);
    room.clearDisplayBuffer = !!parseInt($.getElementsByTagName("clearDisplayBuffer")[0].innerHTML);


    var backgrounds = $.getElementsByTagName("background");
    for(var i=0; i<backgrounds.length; i++)
    {
      room.backgrounds.push(
        {
          visible: !!parseInt(backgrounds[i].getAttribute('visible')),
          foreground: !!parseInt(backgrounds[i].getAttribute('foreground')),
          name: backgrounds[i].getAttribute('name'),
          x: parseInt(backgrounds[i].getAttribute('x')),
          y: parseInt(backgrounds[i].getAttribute('y')),
          htiled: !!parseInt(backgrounds[i].getAttribute('htiled')),
          vtiled: !!parseInt(backgrounds[i].getAttribute('vtiled')),
          hspeed: parseInt(backgrounds[i].getAttribute('hspeed')),
          vspeed: parseInt(backgrounds[i].getAttribute('vspeed')),
          stretch: !!parseInt(backgrounds[i].getAttribute('stretch')),
        }
      );
    }

    var views = $.getElementsByTagName("view");
    for(var i=0; i<views.length; i++)
    {
      room.views.push(
        {
          visible: !!parseInt(views[i].getAttribute('visible')),
          objName: (views[i].getAttribute('objName') != "<undefined>" && views[i].getAttribute('objName') != '&lt;undefined&gt;') ? views[i].getAttribute('objName') : "",
          xView: parseInt(views[i].getAttribute('xview')),
          yView: parseInt(views[i].getAttribute('yview')),
          wView: parseInt(views[i].getAttribute('wview')),
          hView: parseInt(views[i].getAttribute('hview')),
          xPort: parseInt(views[i].getAttribute('xport')),
          yPort: parseInt(views[i].getAttribute('yport')),
          wPort: parseInt(views[i].getAttribute('wport')),
          hPort: parseInt(views[i].getAttribute('hport')),
          hBorder: parseInt(views[i].getAttribute('hborder')),
          vBorder: parseInt(views[i].getAttribute('vborder')),
          hspeed: parseInt(views[i].getAttribute('hspeed')),
          vspeed: parseInt(views[i].getAttribute('vspeed'))
        }
      );
    }

    var instances = $.getElementsByTagName("instance");
    for(var i=0; i<instances.length; i++)
    {
      room.instances.push(
        {
          objName: instances[i].getAttribute('objName'),
          x: parseInt(instances[i].getAttribute('x')),
          y: parseInt(instances[i].getAttribute('y')),
          name: instances[i].getAttribute('name'),
          code: instances[i].getAttribute('code'),
          scaleX: parseFloat(instances[i].getAttribute('scalex')),
          scaleY: parseFloat(instances[i].getAttribute('scaley')),
          color: parseInt(instances[i].getAttribute('colour')),
          rotation: parseInt(instances[i].getAttribute('rotation')),
        }
      );
    }

    var tiles = $.getElementsByTagName("tile");
    for(var i=0; i<tiles.length; i++)
    {
      room.tiles.push(
        {
          bgName: tiles[i].getAttribute('bgName'),
          x: parseInt(tiles[i].getAttribute('x')),
          y: parseInt(tiles[i].getAttribute('y')),
          w: parseInt(tiles[i].getAttribute('w')),
          h: parseInt(tiles[i].getAttribute('h')),
          xo: parseInt(tiles[i].getAttribute('xo')),
          yo: parseInt(tiles[i].getAttribute('yo')),
          id: parseInt(tiles[i].getAttribute('id')),
          name: tiles[i].getAttribute('name'),
          depth: parseInt(tiles[i].getAttribute('depth')),
          color: parseInt(tiles[i].getAttribute('colour')),
          scaleX: parseFloat(tiles[i].getAttribute('scalex')),
          scaleY: parseFloat(tiles[i].getAttribute('scaley')),
        }
      );
    }


    room.physics.usePhysics = !!parseInt($.getElementsByTagName('PhysicsWorld')[0].innerHTML);
    room.physics.gravityX = parseFloat($.getElementsByTagName('PhysicsWorldGravityX')[0].innerHTML);
    room.physics.gravityY = parseFloat($.getElementsByTagName('PhysicsWorldGravityY')[0].innerHTML);
    room.physics.pixelsToMeters = parseFloat($.getElementsByTagName('PhysicsWorldPixToMeters')[0].innerHTML);

    return room;

  }
}
