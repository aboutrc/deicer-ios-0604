/*
  # Restore rights sections content
  
  1. Changes
    - Add initial rights sections content
    - Include multilingual support (EN/ES/ZH/HI/AR)
    - Preserve existing table structure
*/

-- Insert rights sections content
INSERT INTO rights_sections (id, title, content, "order", is_case_law)
VALUES
  -- Constitution Overview
  (
    gen_random_uuid(),
    jsonb_build_object(
      'en', 'The U.S. Constitution Protects Everyone',
      'es', 'La Constitución de EE.UU. Protege a Todos',
      'zh', '美国宪法保护所有人',
      'hi', 'अमेरिकी संविधान सभी की रक्षा करता है',
      'ar', 'دستور الولايات المتحدة يحمي الجميع'
    ),
    jsonb_build_object(
      'en', jsonb_build_array(
        'Everyone in the U.S. is Protected by the U.S. Constitution—Citizen or Not.',
        'The U.S. Constitution protects everyone that is physically in the U.S and is not meant for only citizens of the U.S.',
        'These rights ensure fair treatment for all.'
      ),
      'es', jsonb_build_array(
        'Todos en los EE.UU. están protegidos por la Constitución, sean ciudadanos o no.',
        'La Constitución protege a todos los que están físicamente en los EE.UU. y no está destinada solo a los ciudadanos.',
        'Estos derechos aseguran un trato justo para todos.'
      ),
      'zh', jsonb_build_array(
        '在美国境内的每个人都受美国宪法保护——无论是否为公民。',
        '美国宪法保护所有在美国境内的人，而不仅仅是美国公民。',
        '这些权利确保所有人得到公平对待。'
      ),
      'hi', jsonb_build_array(
        'अमेरिका में हर व्यक्ति अमेरिकी संविधान द्वारा संरक्षित है—नागरिक हो या नहीं।',
        'अमेरिकी संविधान अमेरिका में शारीरिक रूप से मौजूद हर व्यक्ति की रक्षा करता है और यह केवल अमेरिकी नागरिकों के लिए नहीं है।',
        'ये अधिकार सभी के लिए निष्पक्ष व्यवहार सुनिश्चित करते हैं।'
      ),
      'ar', jsonb_build_array(
        'كل شخص في الولايات المتحدة محمي بموجب الدستور الأمريكي - سواء كان مواطناً أم لا.',
        'يحمي الدستور الأمريكي كل من هو موجود فعلياً في الولايات المتحدة وليس مخصصاً فقط لمواطني الولايات المتحدة.',
        'هذه الحقوق تضمن معاملة عادلة للجميع.'
      )
    ),
    1,
    false
  ),
  
  -- Constitutional Amendments
  (
    gen_random_uuid(),
    jsonb_build_object(
      'en', 'Important Constitutional Amendments',
      'es', 'Enmiendas Constitucionales Importantes',
      'zh', '重要宪法修正案',
      'hi', 'महत्वपूर्ण संवैधानिक संशोधन',
      'ar', 'التعديلات الدستورية المهمة'
    ),
    jsonb_build_object(
      'en', jsonb_build_array(
        'Fifth Amendment:',
        '• Right to stay quiet if talking might get you in trouble',
        '• Everyone gets fair treatment by the law',
        '',
        'Fourth Amendment:',
        '• Police need a warrant, a judge''s permission, to search you or your things',
        '• A warrant is different from an ICE order: A warrant comes from a judge, while an ICE order does not',
        '• Protects your privacy, including immigrants',
        '',
        'Fourteenth Amendment:',
        '• Everyone deserves fair legal processes',
        '• Laws must treat everyone equally, giving the same rights to all'
      ),
      'es', jsonb_build_array(
        'Quinta Enmienda:',
        '• Derecho a permanecer en silencio si hablar podría causarte problemas',
        '• Todos reciben un trato justo ante la ley',
        '',
        'Cuarta Enmienda:',
        '• La policía necesita una orden judicial para registrarte a ti o tus pertenencias',
        '• Una orden judicial es diferente de una orden de ICE: La orden judicial viene de un juez, la orden de ICE no',
        '• Protege tu privacidad, incluyendo a los inmigrantes',
        '',
        'Decimocuarta Enmienda:',
        '• Todos merecen procesos legales justos',
        '• Las leyes deben tratar a todos por igual, otorgando los mismos derechos'
      ),
      'zh', jsonb_build_array(
        '第五修正案：',
        '• 如果说话可能会给自己带来麻烦，有权保持沉默',
        '• 每个人都受到法律的公平对待',
        '',
        '第四修正案：',
        '• 警察需要法官签发的搜查令才能搜查你或你的物品',
        '• 搜查令与移民局命令不同：搜查令来自法官，而移民局命令不是',
        '• 保护你的隐私，包括移民',
        '',
        '第十四修正案：',
        '• 每个人都应得到公平的法律程序',
        '• 法律必须平等对待所有人，给予所有人相同的权利'
      ),
      'hi', jsonb_build_array(
        'पांचवां संशोधन:',
        '• यदि बोलने से आप मुसीबत में पड़ सकते हैं तो चुप रहने का अधिकार',
        '• हर किसी को कानून द्वारा निष्पक्ष व्यवहार मिलता है',
        '',
        'चौथा संशोधन:',
        '• पुलिस को आपकी या आपकी चीजों की तलाशी के लिए वारंट, एक न्यायाधीश की अनुमति की आवश्यकता होती है',
        '• वारंट ICE आदेश से अलग होता है: वारंट न्यायाधीश से आता है, जबकि ICE आदेश नहीं',
        '• आपकी गोपनीयता की रक्षा करता है, प्रवासियों सहित',
        '',
        'चौदहवां संशोधन:',
        '• हर किसी को निष्पक्ष कानूनी प्रक्रियाओं का अधिकार है',
        '• कानूनों को सभी के साथ समान व्यवहार करना चाहिए, सभी को समान अधिकार देना चाहिए'
      ),
      'ar', jsonb_build_array(
        'التعديل الخامس:',
        '• الحق في البقاء صامتاً إذا كان التحدث قد يعرضك للمشاكل',
        '• الجميع يحصل على معاملة عادلة بموجب القانون',
        '',
        'التعديل الرابع:',
        '• تحتاج الشرطة إلى أمر تفتيش، إذن من قاضٍ، لتفتيشك أو تفتيش أغراضك',
        '• أمر التفتيش يختلف عن أمر ICE: أمر التفتيش يأتي من قاضٍ، بينما أمر ICE لا يأتي من قاضٍ',
        '• يحمي خصوصيتك، بما في ذلك المهاجرين',
        '',
        'التعديل الرابع عشر:',
        '• الجميع يستحق إجراءات قانونية عادلة',
        '• يجب أن تعامل القوانين الجميع بالتساوي، وتمنح نفس الحقوق للجميع'
      )
    ),
    2,
    false
  ),
  
  -- ICE Home Encounters
  (
    gen_random_uuid(),
    jsonb_build_object(
      'en', 'What Happens If ICE Comes to My Home',
      'es', 'Qué Hacer Si ICE Viene a Mi Casa',
      'zh', '如果移民局来到我家该怎么办',
      'hi', 'यदि ICE मेरे घर आता है तो क्या होगा',
      'ar', 'ماذا يحدث إذا جاء ICE إلى منزلي'
    ),
    jsonb_build_object(
      'en', jsonb_build_array(
        'You have the right to remain silent and do not have to discuss your immigration status',
        'Ask if they have a warrant signed by a judge. If they don''t, you can refuse to let them in',
        'Stay calm and keep the door closed',
        'If they have a valid warrant, you may have to let them in, but you still have the right to remain silent and consult a lawyer',
        'Do not sign any documents without speaking to an attorney'
      ),
      'es', jsonb_build_array(
        'Tienes derecho a guardar silencio y no tienes que discutir tu estatus migratorio',
        'Pregunta si tienen una orden judicial firmada por un juez. Si no la tienen, puedes negarte a dejarlos entrar',
        'Mantén la calma y mantén la puerta cerrada',
        'Si tienen una orden válida, puede que tengas que dejarlos entrar, pero aún tienes derecho a guardar silencio y consultar a un abogado',
        'No firmes ningún documento sin hablar con un abogado'
      ),
      'zh', jsonb_build_array(
        '你有权保持沉默，不必讨论你的移民身份',
        '询问他们是否有法官签署的搜查令。如果没有，你可以拒绝让他们进入',
        '保持冷静，保持门关闭',
        '如果他们有有效的搜查令，你可能必须让他们进入，但你仍然有权保持沉默并咨询律师',
        '在未咨询律师之前不要签署任何文件'
      ),
      'hi', jsonb_build_array(
        'आपको चुप रहने का अधिकार है और आपको अपनी आव्रजन स्थिति पर चर्चा करने की आवश्यकता नहीं है',
        'पूछें कि क्या उनके पास न्यायाधीश द्वारा हस्ताक्षरित वारंट है। यदि नहीं है, तो आप उन्हें अंदर आने से मना कर सकते हैं',
        'शांत रहें और दरवाजा बंद रखें',
        'यदि उनके पास वैध वारंट है, तो आपको उन्हें अंदर आने देना पड़ सकता है, लेकिन आपको अभी भी चुप रहने और वकील से परामर्श करने का अधिकार है',
        'वकील से बात किए बिना कोई दस्तावेज पर हस्ताक्षर न करें'
      ),
      'ar', jsonb_build_array(
        'لديك الحق في البقاء صامتاً ولست مضطراً لمناقشة وضعك كمهاجر',
        'اسأل إذا كان لديهم أمر تفتيش موقع من قاضٍ. إذا لم يكن لديهم، يمكنك رفض السماح لهم بالدخول',
        'ابق هادئاً وأبقِ الباب مغلقاً',
        'إذا كان لديهم أمر تفتيش صالح، قد تضطر للسماح لهم بالدخول، لكن لا يزال لديك الحق في البقاء صامتاً واستشارة محامٍ',
        'لا توقع على أي مستندات دون التحدث مع محامٍ'
      )
    ),
    3,
    false
  ),
  
  -- ICE Street Encounters
  (
    gen_random_uuid(),
    jsonb_build_object(
      'en', 'What Happens If ICE Approaches Me on the Street',
      'es', 'Qué Hacer Si ICE Me Aborda en la Calle',
      'zh', '如果移民局在街上拦截我该怎么办',
      'hi', 'यदि ICE मुझे सड़क पर रोकता है तो क्या होगा',
      'ar', 'ماذا يحدث إذا اقترب مني ICE في الشارع'
    ),
    jsonb_build_object(
      'en', jsonb_build_array(
        'You have the right to remain silent and do not have to discuss your immigration status',
        'Ask if you are free to leave. If they say yes, calmly walk away',
        'You have the right to refuse to show identification or answer questions',
        'Remember, you do not have to sign any documents without speaking to an attorney'
      ),
      'es', jsonb_build_array(
        'Tienes derecho a guardar silencio y no tienes que discutir tu estatus migratorio',
        'Pregunta si eres libre de irte. Si dicen que sí, aléjate calmadamente',
        'Tienes derecho a negarte a mostrar identificación o responder preguntas',
        'Recuerda, no tienes que firmar ningún documento sin hablar con un abogado'
      ),
      'zh', jsonb_build_array(
        '你有权保持沉默，不必讨论你的移民身份',
        '询问你是否可以离开。如果他们说可以，平静地走开',
        '你有权拒绝出示身份证件或回答问题',
        '记住，在未咨询律师之前不要签署任何文件'
      ),
      'hi', jsonb_build_array(
        'आपको चुप रहने का अधिकार है और आपको अपनी आव्रजन स्थिति पर चर्चा करने की आवश्यकता नहीं है',
        'पूछें कि क्या आप जा सकते हैं। यदि वे हां कहते हैं, तो शांति से चले जाएं',
        'आपको पहचान पत्र दिखाने या प्रश्नों के उत्तर देने से इनकार करने का अधिकार है',
        'याद रखें, वकील से बात किए बिना आपको किसी दस्तावेज पर हस्ताक्षर करने की आवश्यकता नहीं है'
      ),
      'ar', jsonb_build_array(
        'لديك الحق في البقاء صامتاً ولست مضطراً لمناقشة وضعك كمهاجر',
        'اسأل إذا كنت حراً في المغادرة. إذا قالوا نعم، ابتعد بهدوء',
        'لديك الحق في رفض إظهار الهوية أو الإجابة على الأسئلة',
        'تذكر، لست مضطراً لتوقيع أي مستندات دون التحدث مع محامٍ'
      )
    ),
    4,
    false
  ),
  
  -- Case Law
  (
    gen_random_uuid(),
    jsonb_build_object(
      'en', 'Important Legal Cases',
      'es', 'Casos Legales Importantes',
      'zh', '重要法律案例',
      'hi', 'महत्वपूर्ण कानूनी मामले',
      'ar', 'قضايا قانونية مهمة'
    ),
    jsonb_build_object(
      'en', jsonb_build_array(
        'Yick Wo v. Hopkins (1886)',
        'Established that the Equal Protection Clause of the 14th Amendment applies to all persons, not just citizens, reinforcing constitutional protections for immigrants.',
        'Learn more: https://en.wikipedia.org/wiki/Yick_Wo_v._Hopkins',
        '',
        'Zadvydas v. Davis (2001)',
        'Limited the government''s power to indefinitely detain immigrants who have been ordered removed but cannot be deported.',
        'Learn more: https://en.wikipedia.org/wiki/Zadvydas_v._Davis',
        '',
        'Plyler v. Doe (1982)',
        'Established that states cannot deny public education to undocumented immigrant children.',
        'Learn more: https://en.wikipedia.org/wiki/Plyler_v._Doe'
      ),
      'es', jsonb_build_array(
        'Yick Wo v. Hopkins (1886)',
        'Estableció que la Cláusula de Protección Igualitaria de la 14ª Enmienda se aplica a todas las personas, no solo a los ciudadanos, reforzando las protecciones constitucionales para inmigrantes.',
        'Más información: https://en.wikipedia.org/wiki/Yick_Wo_v._Hopkins',
        '',
        'Zadvydas v. Davis (2001)',
        'Limitó el poder del gobierno para detener indefinidamente a inmigrantes que han recibido orden de deportación pero no pueden ser deportados.',
        'Más información: https://en.wikipedia.org/wiki/Zadvydas_v._Davis',
        '',
        'Plyler v. Doe (1982)',
        'Estableció que los estados no pueden negar educación pública a niños inmigrantes indocumentados.',
        'Más información: https://en.wikipedia.org/wiki/Plyler_v._Doe'
      ),
      'zh', jsonb_build_array(
        'Yick Wo v. Hopkins (1886)',
        '确立第14修正案的平等保护条款适用于所有人，而不仅仅是公民，加强了对移民的宪法保护。',
        '了解更多：https://en.wikipedia.org/wiki/Yick_Wo_v._Hopkins',
        '',
        'Zadvydas v. Davis (2001)',
        '限制政府无限期拘留已被命令驱逐但无法被驱逐的移民的权力。',
        '了解更多：https://en.wikipedia.org/wiki/Zadvydas_v._Davis',
        '',
        'Plyler v. Doe (1982)',
        '确立各州不能拒绝为无证移民儿童提供公共教育。',
        '了解更多：https://en.wikipedia.org/wiki/Plyler_v._Doe'
      ),
      'hi', jsonb_build_array(
        'यिक वो बनाम हॉपकिंस (1886)',
        '14वें संशोधन का समान संरक्षण खंड सभी व्यक्तियों पर लागू होता है, न कि केवल नागरिकों पर, जो प्रवासियों के लिए संवैधानिक सुरक्षा को मजबूत करता है।',
        'अधिक जानें: https://en.wikipedia.org/wiki/Yick_Wo_v._Hopkins',
        '',
        'जैडवाइडस बनाम डेविस (2001)',
        'सरकार की शक्ति को सीमित किया जो उन प्रवासियों को अनिश्चित काल तक हिरासत में रखने की थी जिन्हें निष्कासित करने का आदेश दिया गया था लेकिन निर्वासित नहीं किया जा सकता।',
        'अधिक जानें: https://en.wikipedia.org/wiki/Zadvydas_v._Davis',
        '',
        'प्लाइलर बनाम डो (1982)',
        'स्थापित किया कि राज्य अप्रलेखित प्रवासी बच्चों को सार्वजनिक शिक्षा से वंचित नहीं कर सकते।',
        'अधिक जानें: https://en.wikipedia.org/wiki/Plyler_v._Doe'
      ),
      'ar', jsonb_build_array(
        'يك وو ضد هوبكنز (1886)',
        'أسست أن بند الحماية المتساوية من التعديل الرابع عشر ينطبق على جميع الأشخاص، وليس فقط المواطنين، مما يعزز الحماية الدستورية للمهاجرين.',
        'معرفة المزيد: https://en.wikipedia.org/wiki/Yick_Wo_v._Hopkins',
        '',
        'زادفيداس ضد ديفيس (2001)',
        'حدّت من سلطة الحكومة في احتجاز المهاجرين إلى أجل غير مسمى الذين صدرت أوامر بترحيلهم ولكن لا يمكن ترحيلهم.',
        'معرفة المزيد: https://en.wikipedia.org/wiki/Zadvydas_v._Davis',
        '',
        'بلايلر ضد دو (1982)',
        'أسست أن الولايات لا يمكنها حرمان الأطفال المهاجرين غير الموثقين من التعليم العام.',
        'معرفة المزيد: https://en.wikipedia.org/wiki/Plyler_v._Doe'
      )
    ),
    5,
    true
  );