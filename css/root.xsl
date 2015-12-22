<?xml-stylesheet type="text/xsl" href="#style1"?>
<xsl:stylesheet id="style1" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="html"
 doctype-system="http://www.w3.org/TR/html4/strict.dtd" 
 doctype-public="-//W3C//DTD HTML 4.01//EN" indent="yes"/>

<xsl:template name="string-replace-all">
    <xsl:param name="text" />
    <xsl:param name="replace" />
    <xsl:param name="by" />
    <xsl:choose>
        <xsl:when test="contains($text, $replace)">
            <xsl:value-of select="substring-before($text,$replace)" />
            <xsl:value-of select="$by" />
            <xsl:call-template name="string-replace-all">
                <xsl:with-param name="text" select="substring-after($text,$replace)" />
                <xsl:with-param name="replace" select="$replace" />
                <xsl:with-param name="by" select="$by" />
            </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
            <xsl:value-of select="$text" />
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>

<xsl:variable name="_lf">&#xA;</xsl:variable>
<xsl:variable name="lf" select="string($_lf)"/>

<xsl:template match="root">
  <html>
  <head>
    <title>XML Preview</title>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <table width="100%" border="1" cellpadding="5">
      <xsl:for-each select="/root/LINE">
          <tr>
            <xsl:variable name="_newtext-2">
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="." />
                    <xsl:with-param name="replace" select="'&amp;'" />
                    <xsl:with-param name="by" select="'&amp;amp;'" />
                </xsl:call-template>
            </xsl:variable>
            <xsl:variable name="_newtext-1">
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="$_newtext-2" />
                    <xsl:with-param name="replace" select="'&gt;'" />
                    <xsl:with-param name="by" select="'&amp;gt;'" />
                </xsl:call-template>
            </xsl:variable>
            <xsl:variable name="_newtext0">
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="$_newtext-1" />
                    <xsl:with-param name="replace" select="'&lt;'" />
                    <xsl:with-param name="by" select="'&amp;lt;'" />
                </xsl:call-template>
            </xsl:variable>
            <xsl:variable name="newtext">
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="$_newtext0" />
                    <xsl:with-param name="replace" select="$lf" />
                    <xsl:with-param name="by" select="concat('⏎','&lt;br/&gt;')" />
                </xsl:call-template>
            </xsl:variable>
            <xsl:variable name="newattr">
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="./@val" />
                    <xsl:with-param name="replace" select="'|'" />
                    <xsl:with-param name="by" select="'| '" />
                </xsl:call-template>
            </xsl:variable>
            <td width="1%"><xsl:value-of select="substring-before(./@val,'|')"/></td>
            <td width="1%"><xsl:value-of select="substring-after(substring-after(substring-after(substring-after($newattr,'|'),'|'),'|'),'|')"/></td>
            <td width="100%"><div style="line-height:150%;white-space:pre-wrap"><xsl:value-of select="$newtext" disable-output-escaping="yes"/></div><xsl:if test="./@gazo"><xsl:variable name="gazonm" select="./@gazo" /><a href="https://www.jtbgenesis.com/pic/tour/{$gazonm}" target="_blank"><xsl:value-of select="$gazonm"/></a></xsl:if></td>
          </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
