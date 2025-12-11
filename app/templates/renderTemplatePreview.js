// app/templates/renderTemplatePreview.js
import React from "react";
import { View, Text, Image } from "react-native";
import { previewBaseStyles, minimalWhiteStyles } from "./templateStyles";

// Merge all style groups into a single object
const styles = {
  ...previewBaseStyles,
  ...minimalWhiteStyles,
};

/**
 * Single source of truth for how each template is visually rendered.
 *
 * @param {object} params
 * @param {string} params.templateId
 * @param {object} params.data - normalized preview data
 * @param {string|null} params.photoUri - optional photo uri
 */
export function renderTemplatePreview({ templateId, data, photoUri }) {
  const {
    name,
    headline,
    summary,
    contact,
    experience,
    education,
    skills,
    projects,
    languages,
    expertise,
    certificates,
    publishes,
    referrals,
  } = data;

  const mainName = name || "Your Name";
  const mainHeadline = headline || "Target Role / Headline";

  const Section = ({ title, text, sectionStyle, titleStyle, bodyStyle }) => {
    if (!text?.trim()) return null;
    return (
      <View style={sectionStyle || styles.pvSection}>
        <Text style={titleStyle || styles.pvSectionTitle}>{title}</Text>
        <Text style={bodyStyle || styles.pvSectionBody}>{text.trim()}</Text>
      </View>
    );
  };

  const toChips = (text = "") =>
    text
      .split(/[,;•\n]+/g)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);

  const renderSkillChips = (text, chipWrapStyle, chipStyle, chipTextStyle) => {
    const chips = toChips(text);
    if (!chips.length) return null;
    return (
      <View style={chipWrapStyle || styles.pvChipWrap}>
        {chips.map((c, idx) => (
          <View key={idx} style={chipStyle || styles.pvChip}>
            <Text style={chipTextStyle || styles.pvChipText}>{c}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContact = (text, lineStyle) => {
    if (!text?.trim()) return null;
    return (
      <View style={styles.pvContactBlock}>
        {text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line, idx) => (
            <Text key={idx} style={lineStyle || styles.pvContactText}>
              {line}
            </Text>
          ))}
      </View>
    );
  };

  switch (templateId) {
    /**
     * 0) MINIMAL WHITE
     */
    case "minimalWhite": {
      const contactLines = contact
        ? contact
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

      const hasSkills = !!skills?.trim();

      return (
        <View style={styles.mwPageOuter}>
          <View style={styles.mwPageInner}>
            {/* Header */}
            <View style={styles.mwHeader}>
              {/* PHOTO LEFT */}
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.mwPhoto} />
              ) : (
                <View style={styles.mwPhotoPreviewPlaceholder}>
                  <Text style={styles.mwPhotoInitials}>
                    {mainName
                      ? mainName
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "PH"}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.mwName}>
                  {mainName || "YOUR NAME"}
                </Text>
                <Text style={styles.mwRole}>
                  {mainHeadline || "Target Role / Headline"}
                </Text>
              </View>
              <View style={styles.mwHeaderRight}>
                <Text style={styles.mwHeaderRightText}>RESUME</Text>
              </View>
            </View>

            <View style={styles.mwDivider} />

            {/* Body: two columns */}
            <View style={styles.mwBodyRow}>
              {/* LEFT COLUMN */}
              <View style={styles.mwLeftCol}>
                {/* Contact */}
                {contactLines.length > 0 && (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>CONTACT</Text>
                    {contactLines.map((line, idx) => (
                      <Text key={idx} style={styles.mwSmallText}>
                        {line}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Profile / Summary */}
                {summary?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>PROFILE</Text>
                    <Text style={styles.mwBodyText}>{summary.trim()}</Text>
                  </View>
                ) : null}

                {/* Skills */}
                {hasSkills && (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>SKILLS</Text>
                    <View style={styles.mwBulletGroup}>
                      {skills
                        .split(/[,;•\n]+/g)
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .slice(0, 12)
                        .map((skill, idx) => (
                          <Text key={idx} style={styles.mwSmallText}>
                            • {skill}
                          </Text>
                        ))}
                    </View>
                  </View>
                )}

                {/* Languages (optional) */}
                {languages?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>LANGUAGES</Text>
                    <Text style={styles.mwBodyText}>
                      {languages.trim()}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* RIGHT COLUMN */}
              <View style={styles.mwRightCol}>
                {/* Experience */}
                {experience?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>EXPERIENCE</Text>
                    <Text style={styles.mwBodyText}>
                      {experience.trim()}
                    </Text>
                  </View>
                ) : null}

                {/* Projects */}
                {projects?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>PROJECTS</Text>
                    <Text style={styles.mwBodyText}>
                      {projects.trim()}
                    </Text>
                  </View>
                ) : null}

                {/* Education */}
                {education?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>EDUCATION</Text>
                    <Text style={styles.mwBodyText}>
                      {education.trim()}
                    </Text>
                  </View>
                ) : null}

                {/* Extras – expertise / certificates / publishes */}
                {expertise?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>EXPERTISE</Text>
                    <Text style={styles.mwBodyText}>
                      {expertise.trim()}
                    </Text>
                  </View>
                ) : null}

                {certificates?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>CERTIFICATES</Text>
                    <Text style={styles.mwBodyText}>
                      {certificates.trim()}
                    </Text>
                  </View>
                ) : null}

                {publishes?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>
                      PUBLICATIONS & AWARDS
                    </Text>
                    <Text style={styles.mwBodyText}>
                      {publishes.trim()}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      );
    }

    // Other templates – still stubs for now
    case "classic":
      return (
        <View style={styles.pvPage}>
          {/* Classic Template (TODO) */}
        </View>
      );

    case "traditional":
      return (
        <View style={styles.pvPage}>
          {/* Traditional Template (TODO) */}
        </View>
      );

    case "professional":
      return (
        <View style={styles.pvPage}>
          {/* Professional Template (TODO) */}
        </View>
      );

    case "clear":
      return (
        <View style={styles.pvPage}>
          {/* Clear Template (TODO) */}
        </View>
      );

    case "creative":
      return (
        <View style={styles.pvPage}>
          {/* Creative Template (TODO) */}
        </View>
      );

    // Default fallback
    default:
      return (
        <View style={styles.pvPage}>
          <View style={styles.pvHeaderClassic}>
            <Text style={styles.pvName}>{mainName}</Text>
            <Text style={styles.pvHeadline}>{mainHeadline}</Text>
            {renderContact(contact)}
          </View>
          <Section title="SUMMARY" text={summary} />
          <Section title="EXPERIENCE" text={experience} />
          <Section title="EDUCATION" text={education} />
          <Section title="SKILLS" text={skills} />
          <Section title="PROJECTS" text={projects} />
        </View>
      );
  }
}