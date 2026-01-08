const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['client', 'cleaner'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  imageUrl: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatRoomSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cleaner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  lastMessage: messageSchema,
  unreadCount: {
    client: {
      type: Number,
      default: 0
    },
    cleaner: {
      type: Number,
      default: 0
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


chatRoomSchema.index({ booking: 1 });
chatRoomSchema.index({ client: 1 });
chatRoomSchema.index({ cleaner: 1 });
chatRoomSchema.index({ active: 1, updatedAt: -1 });


chatRoomSchema.methods.addMessage = function(senderId, senderRole, message, imageUrl = null) {
  const newMessage = {
    sender: senderId,
    senderRole,
    message,
    imageUrl,
    read: false,
    timestamp: new Date()
  };

  this.messages.push(newMessage);
  this.lastMessage = newMessage;
  
  
  if (senderRole === 'client') {
    this.unreadCount.cleaner += 1;
  } else {
    this.unreadCount.client += 1;
  }

  this.updatedAt = new Date();
  return this.save();
};


chatRoomSchema.methods.markAsRead = function(userRole) {
  const unreadMessages = this.messages.filter(msg => 
    !msg.read && msg.senderRole !== userRole
  );

  unreadMessages.forEach(msg => {
    msg.read = true;
  });

  
  if (userRole === 'client') {
    this.unreadCount.client = 0;
  } else {
    this.unreadCount.cleaner = 0;
  }

  return this.save();
};

module.exports = mongoose.model('Chat', chatRoomSchema);
