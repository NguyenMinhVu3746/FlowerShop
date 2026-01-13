class AIChatMessage {
  final String role; // 'user' or 'model'
  final List<MessagePart> parts;
  final List<AIProductSuggestion>? suggestions;
  final String? imageAnalysis;

  AIChatMessage({
    required this.role,
    required this.parts,
    this.suggestions,
    this.imageAnalysis,
  });

  factory AIChatMessage.fromJson(Map<String, dynamic> json) {
    return AIChatMessage(
      role: json['role'],
      parts: (json['parts'] as List)
          .map((p) => MessagePart.fromJson(p))
          .toList(),
      suggestions: json['suggestions'] != null
          ? (json['suggestions'] as List)
              .map((s) => AIProductSuggestion.fromJson(s))
              .toList()
          : null,
      imageAnalysis: json['imageAnalysis'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'parts': parts.map((p) => p.toJson()).toList(),
      'suggestions': suggestions?.map((s) => s.toJson()).toList(),
      'imageAnalysis': imageAnalysis,
    };
  }
}

class MessagePart {
  final String? text;
  final String? image; // base64

  MessagePart({
    this.text,
    this.image,
  });

  factory MessagePart.fromJson(Map<String, dynamic> json) {
    return MessagePart(
      text: json['text'],
      image: json['image'],
    );
  }

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (text != null) map['text'] = text;
    if (image != null) map['image'] = image;
    return map;
  }
}

class AIProductSuggestion {
  final String id;
  final String title;
  final String slug;
  final String description;
  final String? image;
  final Map<String, dynamic> category;
  final List<Map<String, dynamic>> prices;
  final int reviewCount;

  AIProductSuggestion({
    required this.id,
    required this.title,
    required this.slug,
    required this.description,
    this.image,
    required this.category,
    required this.prices,
    required this.reviewCount,
  });

  factory AIProductSuggestion.fromJson(Map<String, dynamic> json) {
    return AIProductSuggestion(
      id: json['id'],
      title: json['title'],
      slug: json['slug'],
      description: json['description'],
      image: json['image'],
      category: json['category'] ?? {},
      prices: List<Map<String, dynamic>>.from(json['prices'] ?? []),
      reviewCount: json['reviewCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'description': description,
      'image': image,
      'category': category,
      'prices': prices,
      'reviewCount': reviewCount,
    };
  }
}

class AIChatResponse {
  final String response;
  final List<AIProductSuggestion>? suggestions;
  final String? imageAnalysis;

  AIChatResponse({
    required this.response,
    this.suggestions,
    this.imageAnalysis,
  });

  factory AIChatResponse.fromJson(Map<String, dynamic> json) {
    return AIChatResponse(
      response: json['response'],
      suggestions: json['suggestions'] != null
          ? (json['suggestions'] as List)
              .map((s) => AIProductSuggestion.fromJson(s))
              .toList()
          : null,
      imageAnalysis: json['imageAnalysis'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'response': response,
      'suggestions': suggestions?.map((s) => s.toJson()).toList(),
      'imageAnalysis': imageAnalysis,
    };
  }
}
