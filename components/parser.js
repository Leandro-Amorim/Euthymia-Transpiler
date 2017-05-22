var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');


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
        var $ = cheerio.load(fs.readFileSync(gmPath+gmPathFolder[i]),{decodeEntities: true});
        break;
      }
    }

    $("sound").each(function(i,elem)
    {
      Project.sounds.push(path.basename($(this).text()));
    });

    $("sprite").each(function(i,elem)
    {
      Project.sprites.push(path.basename($(this).text()));
    });

    $("background").each(function(i,elem)
    {
      Project.backgrounds.push(path.basename($(this).text()));
    });

    $("script").each(function(i,elem)
    {
      Project.scripts.push(path.basename($(this).text()));
    });

    $("font").each(function(i,elem)
    {
      Project.fonts.push(path.basename($(this).text()));
    });

    $("object").each(function(i,elem)
    {
      Project.objects.push(path.basename($(this).text()));
    });

    $("room").each(function(i,elem)
    {
      Project.rooms.push(path.basename($(this).text()));
    });

    $("constant").each(function(i,elem)
    {
      var c = {name: $(this).attr('name'),value: $(this).text()};
      Project.constants.push(c);
    });

    $("extension").each(function(i,elem)
    {
      Project.extensions.push(path.basename($(this).text()));
    });


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

    var $ = cheerio.load(fs.readFileSync(object.path + 'sprites/' + name + ".sprite.gmx"),{decodeEntities: true});

    sprite.xOrigin = $("xorig").text();
    sprite.yOrigin = $("yorigin").text();

    sprite.width = $("width").text();
    sprite.height = $("height").text();

    var colKind = parseInt($("colkind").text());
    sprite.preciseCollision = !colKind;

    sprite.images = this.parseFrames($("frames").text());
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

    var $ = cheerio.load(fs.readFileSync(object.path + 'objects/' + name + ".object.gmx"),{decodeEntities: true});

    obj.sprite = $("spriteName").text();
    obj.solid = !!parseInt($("solid").text());

    obj.visible = !!parseInt($("visible").text());
    obj.depth = parseInt($("depth").text());
    obj.persistent = !!parseInt($("persistent").text());

    if ($("parentName").text() != '<undefined>')
    {
      obj.parent = $("parentName").text();
    }

    if ($("maskName").text() != '<undefined>')
    {
      obj.mask = $("maskName").text();
    }

    obj.physics.usePhysics = !!parseInt($("PhysicsObject").text());
    obj.physics.isSensor = !!parseInt($("PhysicsObjectSensor").text());
    obj.physics.shape = parseInt($("PhysicsObjectShape").text());
    obj.physics.density = parseFloat($("PhysicsObjectDensity").text());
    obj.physics.restitution = parseFloat($("PhysicsObjectRestitution").text());
    obj.physics.group = parseInt($("PhysicsObjectGroup").text());
    obj.physics.linearDamping = parseFloat($("PhysicsObjectLinearDamping").text());
    obj.physics.angularDamping = parseFloat($("PhysicsObjectAngularDamping").text());
    obj.physics.friction = parseFloat($("PhysicsObjectFriction").text());
    obj.physics.awake = !!parseInt($("PhysicsObjectAwake").text());
    obj.physics.kinematic = !!parseInt($("PhysicsObjectKinematic").text());

    $("point").each(function(i,elem)
    {
      var str = $(this).text();
      obj.physics.shapePoints.push(
        {
          x: parseInt(str.slice(0, str.indexOf(","))),
          y: parseInt(str.slice(str.indexOf(",")+1,str.length))
        }
    );
    });

    obj.events.create = $('string','event[eventtype="0"]').text();
    obj.events.step = $('string','event[eventtype="3"][enumb="0"]').text();
    obj.events.beginStep = $('string','event[eventtype="3"][enumb="1"]').text();
    obj.events.endStep = $('string','event[eventtype="3"][enumb="2"]').text();
    obj.events.destroy = $('string','event[eventtype="1"]').text();
    obj.events.draw = $('string','event[eventtype="8"][enumb="0"]').text();
    obj.events.drawGUI = $('string','event[eventtype="8"][enumb="64"]').text();
    obj.events.drawBegin = $('string','event[eventtype="8"][enumb="72"]').text();
    obj.events.drawEnd = $('string','event[eventtype="8"][enumb="73"]').text();
    obj.events.drawGUIBegin = $('string','event[eventtype="8"][enumb="74"]').text();
    obj.events.drawGUIEnd = $('string','event[eventtype="8"][enumb="75"]').text();

    for(var i=0; i< 12; i++)
    {
        obj.events["alarm"+String(i)]= $('string','event[eventtype="2"][enumb="'+i+'"]').text();
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

    var $ = cheerio.load(fs.readFileSync(object.path + 'rooms/' + name + ".room.gmx"),{decodeEntities: true});

    room.caption = $("caption").text();
    room.width = parseInt($("width").text());
    room.height = parseInt($("height").text());
    room.speed = parseInt($("speed").text());
    room.persistent = !!parseInt($("persistent").text());
    room.backgroundColor = parseInt($("colour").text());
    room.showBackgroundColor = !!parseInt($("showcolour").text());
    room.creationCode = $("code").text();
    room.enableViews = !!parseInt($("enableViews").text());
    room.clearViewBackground = !!parseInt($("clearViewBackground").text());
    room.clearDisplayBuffer = !!parseInt($("clearDisplayBuffer").text());

    $("background").each(function(i,elem)
    {
      room.backgrounds.push(
        {
          visible: !!parseInt($(this).attr('visible')),
          foreground: !!parseInt($(this).attr('foreground')),
          name: $(this).attr('name'),
          x: parseInt($(this).attr('x')),
          y: parseInt($(this).attr('y')),
          htiled: !!parseInt($(this).attr('htiled')),
          vtiled: !!parseInt($(this).attr('vtiled')),
          hspeed: parseInt($(this).attr('hspeed')),
          vspeed: parseInt($(this).attr('vspeed')),
          stretch: !!parseInt($(this).attr('stretch')),
        }
      );
    });

    $("view").each(function(i,elem)
    {
      room.views.push(
        {
          visible: !!parseInt($(this).attr('visible')),
          objName: $(this).attr('objName'),
          xView: parseInt($(this).attr('xview')),
          yView: parseInt($(this).attr('yview')),
          wView: parseInt($(this).attr('wview')),
          hView: parseInt($(this).attr('hview')),
          xPort: parseInt($(this).attr('xport')),
          yPort: parseInt($(this).attr('yport')),
          wPort: parseInt($(this).attr('wport')),
          hPort: parseInt($(this).attr('hport')),
          hBorder: parseInt($(this).attr('hborder')),
          vBorder: parseInt($(this).attr('vborder')),
          hspeed: parseInt($(this).attr('hspeed')),
          vspeed: parseInt($(this).attr('vspeed'))
        }
      );
    });

    $("instance").each(function(i,elem)
    {
      room.instances.push(
        {
          objName: $(this).attr('objName'),
          x: parseInt($(this).attr('x')),
          y: parseInt($(this).attr('y')),
          name: $(this).attr('name'),
          code: $(this).attr('code'),
          scaleX: parseInt($(this).attr('scaleX')),
          scaleY: parseInt($(this).attr('scaleY')),
          color: parseInt($(this).attr('colour')),
          rotation: parseInt($(this).attr('rotation')),
        }
      );
    });

    $("tile").each(function(i,elem)
    {
      room.tiles.push(
        {
          bgName: $(this).attr('bgName'),
          x: parseInt($(this).attr('x')),
          y: parseInt($(this).attr('y')),
          w: parseInt($(this).attr('w')),
          h: parseInt($(this).attr('h')),
          xo: parseInt($(this).attr('xo')),
          yo: parseInt($(this).attr('yo')),
          id: parseInt($(this).attr('id')),
          name: $(this).attr('name'),
          depth: parseInt($(this).attr('depth')),
          color: parseInt($(this).attr('colour')),
          scaleX: parseInt($(this).attr('scaleX')),
          scaleY: parseInt($(this).attr('scaleY')),
        }
      );
    });

    room.physics.usePhysics = !!parseInt($(this).attr('PhysicsWorld'));
    room.physics.gravityX = parseFloat($(this).attr('PhysicsWorldGravityX'));
    room.physics.gravityY = parseFloat($(this).attr('PhysicsWorldGravityY'));
    room.physics.pixelsToMeters = parseFloat($(this).attr('PhysicsWorldPixToMeters'));

    return room;

  }
}
