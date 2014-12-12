var Weebly = {};

// Credit for meat list to https://github.com/petenelson/bacon-ipsum
Weebly.meat = ['beef', 'chicken', 'pork', 'bacon', 'chuck', 'short loin',
  'sirloin', 'shank', 'flank', 'sausage', 'pork belly', 'shoulder', 'cow',
  'pig', 'ground round', 'hamburger', 'meatball', 'tenderloin', 'strip steak',
  't-bone', 'ribeye', 'shankle', 'tongue', 'tail', 'pork chop', 'pastrami',
  'corned beef', 'jerky', 'ham', 'fatback', 'ham hock', 'pancetta', 
  'pork loin', 'short ribs', 'spare ribs', 'beef ribs', 'drumstick', 'tri-tip',
  'ball tip', 'venison', 'turkey', 'biltong', 'rump', 'jowl', 'salami',
  'bresaola', 'meatloaf', 'brisket', 'boudin', 'andouille', 'capicola',
  'swine', 'kielbasa', 'frankfurter', 'prosciutto', 'filet mignon', 'leberkas',
  'turducken', 'doner', 'kevin', 'landjaeger', 'porchetta',
  'consectetur', 'adipisicing', 'elit', 'sed', 'do', 'eiusmod',
  'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'ut',
  'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco',
  'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
  'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'in', 'voluptate', 'velit',
  'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'in', 'culpa', 
  'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

Weebly.loremParagraph = [];

Weebly.LoremIpsum = function(lines) {
  if(Weebly.loremParagraph.length < lines) { // Initialize Bacon ipsum
    for(var line = 0; line < (lines < 10 ? 40 : lines * 4); line ++) {
      var thisLine = [];
      if(line === 0) thisLine.push('Bacon');

      for(var word = 0; word < Math.random() * 5 + 7; word ++) {
        thisLine.push(Weebly.meat[Math.floor(Math.random() * Weebly.meat.length)])
      }
      Weebly.loremParagraph.push(thisLine.join(' '));
    }
  }

  return Weebly.loremParagraph.slice(0, lines).join('\n');
};